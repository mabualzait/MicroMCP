## Quickstart (MVP skeleton)

Prereqs: Node.js 18+

1. Start the gateway (spawns services via stdio using the discovery manifest):

```
node gateway/src/index.js --config gateway/gateway.config.example.json --discovery gateway/discovery.example.json
```

You should see logs indicating the three services (`fs`, `http`, `vector`) were spawned.

2. Invoke through the gateway (NDJSON JSON-RPC on stdin/stdout):

Call fs.listDir via the gateway (with optional static token):

```
printf '{"jsonrpc":"2.0","id":1,"auth":"changeme","method":"fs.listDir","params":{"path":"."}}\n' | \
  node gateway/src/index.js --config gateway/gateway.config.example.json --discovery gateway/discovery.example.json | cat
```

You should receive a JSON-RPC result with directory entries.

3. (Optional) Invoke services directly (bypass gateway for debugging):

For now, call the micro‑services directly by piping NDJSON requests. Example (filesystem list):

```
echo '{"jsonrpc":"2.0","id":1,"method":"fs.listDir","params":{"path":"."}}' | node services/fs/server.js
```

HTTP fetch (allowlist must include the URL):

```
ALLOWLIST="https://example.com" \
  echo '{"jsonrpc":"2.0","id":1,"method":"http.fetchText","params":{"url":"https://example.com"}}' | node services/http/server.js
```

Vector search:

```
(echo '{"jsonrpc":"2.0","id":1,"method":"vector.addDocument","params":{"id":"doc1","text":"hello world"}}'; \
 echo '{"jsonrpc":"2.0","id":2,"method":"vector.search","params":{"query":"hello"}}') | node services/vector/server.js
```

Next: the gateway will proxy JSON‑RPC calls to services and aggregate capabilities.

4. End-to-end demo:

```
bash demo/run-e2e.sh
```

This will list files, fetch a page, add a vector doc, and search via the gateway.


