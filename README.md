## Micro‑MCP: A Microservice Architecture Pattern for the Model Context Protocol

![Micro‑MCP badge](images/Project%20badge%20:%20logo.png)

Micro‑MCP is a theory and reference implementation for composing many small, single‑purpose MCP servers into a secure, observable, and easily deployable "context mesh" for LLMs and agents. Instead of one monolithic MCP server, each capability lives in its own micro‑service and is aggregated at the edge by a lightweight gateway with discovery, policy, and audit.

This repository contains both the conceptual write‑up and an MVP skeleton that demonstrates the pattern end‑to‑end.

![Concept diagram](images/Concept%20:%20hero%20diagram.png)
_High-level concept: Client → Gateway → Micro‑MCP services (fs, http, vector) with discovery/policy/audit._

### Why Micro‑MCP (theory)

- Composition: MCP already standardizes tools/resources/prompts. Micro‑MCP adds a composition layer so many small servers can be plugged together without tight coupling.
- Boundaries: Split capabilities across independent processes with clear security and blast‑radius boundaries.
- Operability: Ship, scale, and roll back capabilities independently, with per‑service logs/metrics/traces.
- Interop: Keep the on‑wire protocol MCP‑compatible so any compliant client/server benefits.

### Core ideas

- Single‑purpose servers: Each micro‑service exposes a narrow set of MCP tools/resources/prompts.
- Aggregation gateway: A thin gateway fronts multiple services, merges capability catalogs, and routes calls by namespace.
- Discovery & policy: A registry or manifest defines which services exist, how to reach them, and which methods are allowed.
- Observability & audit: Cross‑cutting audit logs and metrics at the gateway; local logs/health per service.

### Architecture (high level)

1. Client (LLM/agent) connects to the gateway via an MCP‑compatible transport.
2. The gateway discovers registered micro‑services and names their capabilities (e.g., `fs.*`, `http.fetchText`).
3. Client calls are routed by namespace to the right service; responses are streamed back.
4. Policy (allowlist/scopes) and authentication are enforced at the gateway; services enforce their own outbound permissions.

In this MVP we model the data plane with simple NDJSON JSON‑RPC over stdio for ease of local experimentation.

![Component architecture](images/Component%20architecture%20diagram.png)
_Components and interfaces: Gateway, Registry/Discovery, Policy/Audit, and services._

### Advantages

- Security isolation: Compromise or overload of one service does not cascade to others.
- Deployment agility: Independent versioning, scaling, and rollback per capability.
- Least privilege: Per‑service credentials and fine‑grained gateway policy (scopes/allowlists).
- Clear ownership: Teams own their micro‑MCP service lifecycles and SLOs.
- Testability: Contract tests per tool/resource; conformance tests at the gateway.

![Advantages](images/Advantages%20infographic.png)

### Use cases

- Enterprise integration: Wrap SaaS/internal systems (Jira, GitHub, CRM, DB) as isolated micro‑MCP services.
- Research/data: Controlled access to corpora, web fetchers, and vector stores with policy guardrails.
- Automation: Repeatable task services (release notes, triage, report generation) with deterministic IO.
- Personal productivity: Local file/calendar services with strict least‑privilege.

![Use cases](images/Use%20cases%20board.png)

### How the MVP works (code overview)

- `gateway/src/index.js`: Spawns micro‑services via stdio, routes JSON‑RPC by namespace, enforces a static token and an allowlist policy, writes audit logs to stderr.
- `gateway/discovery.example.json`: Declares three services (`fs`, `http`, `vector`) and how to start them.
- `gateway/gateway.config.example.json`: Static token and policy allowlist (e.g., `fs.*`, `http.fetchText`).
- `services/fs/server.js`: `fs.listDir`, `fs.readFileText` on the local filesystem.
- `services/http/server.js`: `http.fetchText` with a domain allowlist via `ALLOWLIST` env var.
- `services/vector/server.js`: Minimal in‑memory `vector.addDocument` and `vector.search` using cosine similarity over token counts.

Execution model (NDJSON JSON‑RPC):

1. The gateway reads JSON‑RPC messages from stdin and authenticates/authorizes them.
2. It rewrites the `id` to an internal correlation id and forwards to the target service stdio.
3. It reads the service response, restores the client `id`, and writes to stdout.
4. All calls and replies are audited to stderr.

![Request lifecycle](images/Request%20lifecycle%20sequence%20diagram%20.png)
_Authentication, policy, routing, correlation, and audit in the request/response path._

See `docs/QUICKSTART.md` for run instructions and an end‑to‑end demo script.

For a deeper dive into components and flows, read `docs/ARCHITECTURE.md`.

![Deployment topology](images/Deployment%20topology%20%28local%20:%20edge%20:%20cloud%29.png)
_Local, edge, and cloud deployment patterns._

### Prior Art & Novelty

- Micro‑MCP is a new architecture pattern building on the Model Context Protocol (MCP): a gateway aggregates multiple single‑purpose MCP servers with discovery, policy, and audit.
- To the best of our knowledge, there is no established public standard or widely used term for this gateway/registry composition pattern in MCP. This repository proposes and demonstrates that pattern.

### Observations & limitations (MVP)

- Transport: The MVP uses stdio NDJSON for simplicity; production deployments should use MCP transports (e.g., WebSocket) and hardened process isolation.
- Policy: The allowlist is minimal; a full solution should implement scopes, consent prompts, and contextual policy engines.
- Discovery: Static manifest today; future work includes dynamic registry/health and version negotiation.

![Security & policy](images/Security%20%26%20policy%20flow.png)
_Security and policy checks across gateway and services._

### Repository layout

- `gateway/` – aggregator that fronts multiple micro‑MCP services
- `services/` – example micro‑services: `fs/`, `http/`, `vector/`
- `templates/` – TypeScript and Python service templates
- `docs/` – guides, quickstarts, architecture

See `MICRO-MCP-ROADMAP.md` for the longer‑form plan and milestones.

### Project links

- License: `LICENSE` (MIT)
- Security policy: `SECURITY.md`
- Contributing guidelines: `CONTRIBUTING.md`

### Authorship and Origin

- The Micro‑MCP concept and this reference implementation are introduced by Malik Abualzait (2025).
- Preferred reference: "Micro‑MCP: A Microservice Architecture Pattern for the Model Context Protocol," Malik Abualzait, 2025. Repository: this GitHub project.

Suggested citation:

```
Abualzait, M. (2025). Micro‑MCP: A Microservice Architecture Pattern for the Model Context Protocol. GitHub repository.
```



