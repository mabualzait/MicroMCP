## Building Micro‑MCP Services: Patterns, Schemas, and Testing

By Malik Abualzait

### Design goals

- Single responsibility: each service owns one narrow capability domain
- Predictable contracts: JSON‑Schema inputs/outputs; deterministic behavior
- Safe by default: least privilege; defend against common pitfalls

### Patterns

- Filesystem (read‑only root): `fs.listDir`, `fs.readFileText`
- HTTP Fetcher: domain allowlist; size/time limits; content type filters
- Vector Search: `addDocument` + `search`; later swap to a proper index

### Schemas and contracts

- Define input/output JSON‑Schemas and validate at the boundary
- Use clear error categories: user_error, forbidden, transient, internal
- Version your service surface (semver) and declare protocol version

### Testing

- Contract tests per method: valid/invalid inputs; golden outputs
- Security tests: path traversal, domain escape, large payloads
- Conformance tests: protocol behavior (ids, errors, timeouts)

### Observability in services

- Structured logs; health endpoint/command; minimal metrics
- Correlation IDs propagated from gateway when applicable

### Example (this repo)

```sh
echo '{"jsonrpc":"2.0","id":1,"method":"fs.listDir","params":{"path":"."}}' | node services/fs/server.js
```

### Checklist

```text
- [ ] Inputs validated against JSON‑Schema
- [ ] Output shape documented and stable
- [ ] Error taxonomy implemented
- [ ] Security guardrails (allowlists, read‑only, limits)
- [ ] Contract tests and conformance tests
```




