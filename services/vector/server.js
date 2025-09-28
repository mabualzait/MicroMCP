import readline from 'node:readline';
import process from 'node:process';

// Minimal in-memory vector index using cosine similarity with naive token counts
const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

const docs = []; // { id, text, vector }

function respond(id, result, error) {
  const msg = { jsonrpc: '2.0', id, ...(error ? { error } : { result }) };
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function textToVector(text) {
  const counts = new Map();
  for (const token of String(text).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return counts;
}

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, v] of a.entries()) {
    na += v * v;
    if (b.has(k)) dot += v * b.get(k);
  }
  for (const v of b.values()) nb += v * v;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function addDocument(params) {
  const { id, text } = params || {};
  if (!id || !text) throw new Error('id and text required');
  const vector = textToVector(text);
  docs.push({ id, text, vector });
  return { ok: true };
}

function search(params) {
  const { query, k = 5 } = params || {};
  if (!query) throw new Error('query required');
  const qv = textToVector(query);
  const scored = docs.map((d) => ({ id: d.id, score: cosine(qv, d.vector) }));
  scored.sort((a, b) => b.score - a.score);
  return { results: scored.slice(0, k) };
}

const methods = { 'vector.addDocument': addDocument, 'vector.search': search };

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


