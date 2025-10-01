## Micro‑MCP, Explained: Composing MCP with a Gateway and Micro‑Services

By Malik Abualzait

### TL;DR

Micro‑MCP applies microservice thinking to the Model Context Protocol (MCP). Instead of a single, monolithic MCP server, each capability (files, fetch, vector, SaaS) runs as its own tiny MCP service. A thin gateway composes these services, handling discovery, namespacing, authentication/authorization, and audit. You get least‑privilege isolation, independent deployability, and a unified interface for LLMs and agents.

![Concept](../../images/Concept%20:%20hero%20diagram.png)

### The problem

Monolithic MCP servers couple many capabilities in one process and permission set. That increases blast radius, complicates reviews, and slows iteration. Teams need a safer, more operationally friendly way to scale MCP in real environments.

### What is Micro‑MCP?

- Small, single‑purpose MCP services expose narrow tools/resources/prompts.
- A protocol‑aware gateway fronts many services and composes them:
  - discovery and naming (namespaces like `fs.*`, `http.fetchText`)
  - authN/Z (tokens/allowlists/scopes)
  - audit (structured, privacy‑aware logging)

![Components](../../images/Component%20architecture%20diagram.png)

### Why it matters

- Security isolation and least privilege per capability
- Independent deploy/rollback → faster iteration
- Clear ownership, SLIs/SLOs, and observability
- Protocol compatibility with MCP clients/servers

![Advantages](../../images/Advantages%20infographic.png)

### Core ideas

1) Single responsibility per service
2) Namespaced capability catalogs
3) Central policy and audit at the gateway
4) Protocol‑level composition (not framework lock‑in)

### A minimal reference (this repo)

The MVP shows a Node.js gateway plus three micro‑services (filesystem, HTTP fetcher with domain allowlist, vector search). It uses NDJSON JSON‑RPC over stdio for easy local runs.

Quickstart:

```
printf '{"jsonrpc":"2.0","id":1,"auth":"changeme","method":"fs.listDir","params":{"path":"."}}\n' | \
  node gateway/src/index.js --config gateway/gateway.config.example.json --discovery gateway/discovery.example.json | cat
```

End‑to‑end demo:

```
bash demo/run-e2e.sh
```

### Use cases

![Use cases](../../images/Use%20cases%20board.png)

- Enterprise integrations: Jira, GitHub, CRM, DB as isolated services
- Research/data: corpora and vector stores with policy guardrails
- Automation: release notes, triage, reporting with deterministic IO
- Personal productivity: local files/calendar with strict least‑privilege

### Security, briefly

Gateway enforces identity and policy; services use domain‑scoped credentials and validate IO. Audit logs provide accountability. Production adds OIDC/mTLS, purpose binding, redaction, and signed artifacts.

### What’s next in this series

1) Gateway internals (namespaces, routing, policy)
2) Service design patterns and contracts
3) Security: least‑privilege and audit
4) Discovery and capability catalogs
5) Observability (logs/metrics/traces)
6) Deployment (local/edge/cloud)
7) Interop with agent ecosystems
8) Performance and reliability
9) Governance and supply chain

### Get involved

- Explore the repo and run the demo
- Build your first micro‑service (start simple: read‑only files, a single SaaS API)
- Share feedback and ideas for discovery/policy profiles

— Malik





