import fs from 'node:fs';
import readline from 'node:readline';
import process from 'node:process';

// Simple NDJSON JSON-RPC: {id, method, params}
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

function respond(id, result, error) {
  const msg = { jsonrpc: '2.0', id, ...(error ? { error } : { result }) };
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function listDir(params) {
  const dir = params?.path || '.';
  return fs.readdirSync(dir, { withFileTypes: true }).map((d) => ({ name: d.name, dir: d.isDirectory() }));
}

function readFileText(params) {
  const p = params?.path;
  if (!p) throw new Error('path is required');
  return fs.readFileSync(p, 'utf8');
}

const methods = { 'fs.listDir': listDir, 'fs.readFileText': readFileText };

rl.on('line', (line) => {
  try {
    if (!line.trim()) return;
    const msg = JSON.parse(line);
    const fn = methods[msg.method];
    if (!fn) return respond(msg.id, null, { code: -32601, message: 'Method not found' });
    const res = fn(msg.params || {});
    respond(msg.id, res);
  } catch (e) {
    respond(null, null, { code: -32000, message: String(e?.message || e) });
  }
});


