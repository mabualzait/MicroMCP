## Namespaces and Policy: Inside the Micro‑MCP Gateway

By Malik Abualzait

### The story: from monolith to composition

When teams first try MCP, they often pack every capability into a single server: files, fetch, vector, SaaS. It works—until it doesn’t. A single permission error can expose too much. A small change can require a risky redeploy. Logs become a haystack.

Micro‑MCP asks a different question: what if each capability were a tiny server, and a thin gateway did the stitching—discovery, routing, policy, and audit? This post explains that gateway: how it names things, how it routes, and how it decides what’s allowed.

### What the gateway is (and isn’t)

- **Is**: an MCP‑aware aggregator in front of many single‑purpose MCP services.
- **Is not**: a mega‑service that re‑implements your capabilities, nor a generic HTTP API gateway that ignores MCP semantics.

It speaks MCP‑style JSON‑RPC to the client, “fans in” capability catalogs, routes by namespace, and enforces cross‑cutting concerns.

![Components](../../images/Component%20architecture%20diagram.png)

### Namespaces: the language of composition

Namespaces prevent collisions and clarify ownership. In Micro‑MCP they’re part of the method name itself.

- Examples: `fs.listDir`, `http.fetchText`, `vector.search`
- Benefits:
  - Avoids name clashes across services
  - Makes routing trivial (everything before the dot is the target namespace)
  - Helps policy (“allow everything under `fs.*` for this principal”)

Good names are boring: use `team.capability.action` if you expect a large org. Start small and evolve.

### Routing: one line, two ids, zero surprises

The gateway reads a JSON‑RPC message, authenticates, checks policy, then forwards to the namespaced service. To keep client ids intact, it uses an internal correlation id on the hop to the service and restores the client id on the way back.

Request (client → gateway):

```json
{"jsonrpc":"2.0","id":42,"auth":"changeme","method":"fs.listDir","params":{"path":"."}}
```

Forwarded (gateway → fs service):

```json
{"jsonrpc":"2.0","id":1001,"method":"fs.listDir","params":{"path":"."}}
```

Response (service → gateway):

```json
{"jsonrpc":"2.0","id":1001,"result":[{"name":"docs","dir":true}]}
```

Reply (gateway → client):

```json
{"jsonrpc":"2.0","id":42,"result":[{"name":"docs","dir":true}]}
```

That’s it: namespacing determines the target; correlation preserves client experience.

### Policy: from allowlists to contextual decisions

Start simple with an **allowlist**. Patterns like `fs.*` or exact matches like `http.fetchText` cover many needs.

Add **scopes** when different principals need different slices (e.g., `vector.search:read`, `vector.addDocument:write`). Store the decision and the reason in your audit logs.

For high‑risk environments, graduate to **contextual ABAC**: evaluate conditions (caller role, time, resource sensitivity) via a policy engine (OPA/Rego or Cedar). For sensitive actions, add **consent prompts** and **purpose binding** so the user explicitly grants a specific use.

![Security Flow](../../images/Security%20%26%20policy%20flow.png)

### Authentication: dev vs prod

- **MVP**: a static token is fine for local development.
- **Production**: prefer OIDC (bearer tokens) or mTLS. Validate issuer/audience, expiration, and bind tokens to the connection where possible. Favor short‑lived credentials.

### Observability: audit is your superpower

Audit logs are not “nice to have.” They’re how you answer: who did what, when, and why did the system allow it?

Log these fields at minimum:
- `timestamp`, `request_id`, `principal`
- `method` (namespaced), `decision` (allow/deny), `reason`
- `latency_ms`, `result_category` (success, user_error, forbidden, transient)

Add distributed tracing so you can see client → gateway → service spans. Redact sensitive values—never log secrets.

### Failure and resilience

- Apply request size limits and backpressure to protect services
- Use timeouts and circuit breakers for flaky dependencies
- Prefer idempotency for side‑effecting tools, so safe retries are possible

### Performance notes

- Keep persistent connections to services (or long‑lived subprocesses)
- Batch where possible; cache immutable resources by content hash
- For large payloads, move bytes out of the gateway data plane (signed URLs)

### Walkthrough (from this repo)

Run a namespaced call through the gateway:

```sh
printf '{"jsonrpc":"2.0","id":1,"auth":"changeme","method":"fs.listDir","params":{"path":"."}}\n' | \
  node gateway/src/index.js --config gateway/gateway.config.example.json --discovery gateway/discovery.example.json | cat
```

### Checklist for production readiness

```text
Namespaces
- [ ] Namespace scheme documented; collisions linted

Policy
- [ ] Allowlist and scopes in place; tests for deny/allow paths
- [ ] High‑risk methods gated with consent/purpose

Auth
- [ ] OIDC or mTLS configured; tokens short‑lived and verified

Audit/Observability
- [ ] Structured audit with reason codes + tracing
- [ ] PII redaction; no secret logging

Resilience
- [ ] Request size limits; backpressure; timeouts; circuit breakers
```

### FAQ

**Why not just a standard HTTP API gateway?** MCP has a capability catalog and method semantics that benefit from protocol awareness (namespaces, schemas, correlation). A generic gateway can sit in front for TLS or coarse controls, but keep capability policy MCP‑aware.

**Can I merge two services under one namespace?** You can, but you lose isolation and clarity. Prefer separate namespaces unless you’re certain the lifecycle and risk profile are identical.

**How do I evolve names?** Use deprecation windows and aliases. Keep old names alive long enough for clients to migrate; document changes in the catalog.

### Designer‑agent prompt (images for this article)

```text
You are a product designer. Create visuals for the article “Namespaces and Policy: Inside the Micro‑MCP Gateway” (brand per Micro‑MCP style).

1) Gateway Internals Diagram: client → gateway (auth, policy, routing, audit) → services {fs, http, vector}. Show namespaces and decision points. Minimal labels. Export SVG + PNG.
2) Namespacing Cheat‑Sheet: small panel illustrating method names like fs.listDir, http.fetchText, vector.search with rules and collision examples. Export SVG + PNG.
3) Routing Sequence: JSON‑RPC message flow with id rewrite (client id → internal id → client id). Export SVG + PNG.
4) Policy Decision Flow: allowlist → scopes → contextual ABAC → consent. Clear allow/deny branches. Export SVG + PNG.
5) Audit Fields Reference: compact card listing recommended fields (timestamp, request_id, principal, method, decision, reason, latency, result_category). Export SVG + PNG.

Apply brand palette, high readability, and consistent iconography. Include small “Micro‑MCP — Malik Abualzait” mark.
```

### Reference implementation

- Repository: [MicroMCP on GitHub](https://github.com/mabualzait/MicroMCP)


