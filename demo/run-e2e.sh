#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR"

CMD=(node gateway/src/index.js --config gateway/gateway.config.example.json --discovery gateway/discovery.example.json)

{
  printf '{"jsonrpc":"2.0","id":1,"auth":"changeme","method":"fs.listDir","params":{"path":"."}}\n'
  printf '{"jsonrpc":"2.0","id":2,"auth":"changeme","method":"http.fetchText","params":{"url":"https://example.com"}}\n'
  printf '{"jsonrpc":"2.0","id":3,"auth":"changeme","method":"vector.addDocument","params":{"id":"a1","text":"hello world"}}\n'
  printf '{"jsonrpc":"2.0","id":4,"auth":"changeme","method":"vector.search","params":{"query":"hello","k":3}}\n'
} | "${CMD[@]}" | cat


