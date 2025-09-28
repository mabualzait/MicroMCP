import https from 'node:https';
import http from 'node:http';
import readline from 'node:readline';
import process from 'node:process';

const ALLOWLIST = (process.env.ALLOWLIST || 'https://example.com').split(',');

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

function respond(id, result, error) {
  const msg = { jsonrpc: '2.0', id, ...(error ? { error } : { result }) };
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function isAllowed(url) {
  return ALLOWLIST.some((prefix) => url.startsWith(prefix));
}

function fetchText(params) {
  const url = params?.url;
  if (!url) throw new Error('url is required');
  if (!isAllowed(url)) throw new Error('URL not allowlisted');
  const client = url.startsWith('https') ? https : http;
  return new Promise((resolve, reject) => {
    client
      .get(url, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      })
      .on('error', reject);
  });
}

const methods = { 'http.fetchText': fetchText };

rl.on('line', async (line) => {
  try {
    if (!line.trim()) return;
    const msg = JSON.parse(line);
    const fn = methods[msg.method];
    if (!fn) return respond(msg.id, null, { code: -32601, message: 'Method not found' });
    const res = await fn(msg.params || {});
    respond(msg.id, res);
  } catch (e) {
    respond(null, null, { code: -32000, message: String(e?.message || e) });
  }
});


