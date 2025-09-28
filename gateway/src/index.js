import fs from 'node:fs';
import { spawn } from 'node:child_process';
import process from 'node:process';
import readline from 'node:readline';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--discovery') args.discovery = argv[++i];
    else if (a === '--config') args.config = argv[++i];
  }
  return args;
}

function readJson(p) {
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function log(level, msg, extra) {
  const now = new Date().toISOString();
  const entry = { ts: now, level, msg, ...extra };
  // logs to stderr so stdout remains clean for JSON-RPC responses
  process.stderr.write(JSON.stringify(entry) + '\n');
}

function startStdioService(spec) {
  const child = spawn(spec.command, spec.args || [], { stdio: ['pipe', 'pipe', 'pipe'] });
  child.stderr.on('data', (d) => log('warn', `svc:${spec.name}:stderr`, { data: d.toString() }));
  child.on('exit', (code) => log('error', `svc:${spec.name}:exit`, { code }));
  return child;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.discovery) {
    console.error('Missing --discovery <path>');
    process.exit(2);
  }
  const discovery = readJson(args.discovery);
  const config = args.config ? readJson(args.config) : {};

  log('info', 'gateway.start', { services: discovery.services.length });

  const namespaceToChild = new Map();
  for (const svc of discovery.services) {
    if (svc.transport === 'stdio') {
      log('info', 'svc.spawn', { name: svc.name, namespace: svc.namespace, cmd: svc.command, args: svc.args });
      const child = startStdioService(svc);
      namespaceToChild.set(svc.namespace || svc.name, child);
    } else if (svc.transport === 'ws') {
      log('info', 'svc.ws.pending', { name: svc.name, url: svc.url });
    }
  }

  // Setup routing maps
  let nextInternalId = 1;
  const pending = new Map(); // internalId -> clientId

  // Wire child stdout readers
  for (const [ns, child] of namespaceToChild.entries()) {
    const rlc = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    rlc.on('line', (line) => {
      try {
        if (!line.trim()) return;
        const msg = JSON.parse(line);
        const internalId = msg.id;
        const clientId = pending.get(internalId);
        if (clientId === undefined) {
          log('warn', 'orphan.response', { ns, internalId });
          return;
        }
        pending.delete(internalId);
        const out = { jsonrpc: '2.0', id: clientId };
        if (msg.error) out.error = msg.error;
        else out.result = msg.result;
        process.stdout.write(JSON.stringify(out) + '\n');
        log('info', 'audit.reply', { ns, clientId });
      } catch (e) {
        log('error', 'child.line.error', { ns, error: String(e?.message || e) });
      }
    });
  }

  // Read client input and route
  const rli = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  rli.on('line', (line) => {
    try {
      if (!line.trim()) return;
      const msg = JSON.parse(line);
      const { id, method, params, auth } = msg;
      // Static token auth (optional)
      const required = config.auth && config.auth.staticToken;
      if (required && auth !== config.auth.staticToken) {
        const err = { jsonrpc: '2.0', id, error: { code: -32001, message: 'unauthorized' } };
        process.stdout.write(JSON.stringify(err) + '\n');
        log('warn', 'audit.denied', { method });
        return;
      }
      // Scope-based allowlist check
      const allow = (config.policy && Array.isArray(config.policy.allow)) ? config.policy.allow : [];
      const allowed = allow.some((pat) => {
        if (pat.endsWith('.*')) {
          const ns = pat.slice(0, -2);
          return method.startsWith(ns + '.');
        }
        return pat === method;
      });
      if (allow.length > 0 && !allowed) {
        const err = { jsonrpc: '2.0', id, error: { code: -32002, message: 'forbidden' } };
        process.stdout.write(JSON.stringify(err) + '\n');
        log('warn', 'audit.forbidden', { method });
        return;
      }
      if (typeof method !== 'string' || method.indexOf('.') === -1) {
        const err = { jsonrpc: '2.0', id, error: { code: -32601, message: 'invalid method' } };
        process.stdout.write(JSON.stringify(err) + '\n');
        return;
      }
      const ns = method.split('.')[0];
      const child = namespaceToChild.get(ns);
      if (!child) {
        const err = { jsonrpc: '2.0', id, error: { code: -32601, message: `no service for namespace ${ns}` } };
        process.stdout.write(JSON.stringify(err) + '\n');
        return;
      }
      const internalId = nextInternalId++;
      pending.set(internalId, id);
      const forwarded = { jsonrpc: '2.0', id: internalId, method, params: params || {} };
      child.stdin.write(JSON.stringify(forwarded) + '\n');
      log('info', 'audit.call', { ns, method, clientId: id });
    } catch (e) {
      log('error', 'client.line.error', { error: String(e?.message || e) });
    }
  });

  rli.on('close', () => {
    log('info', 'gateway.stdin.closed', {});
    for (const [, child] of namespaceToChild.entries()) {
      try { child.kill(); } catch {}
    }
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


