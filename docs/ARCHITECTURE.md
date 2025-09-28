## Micro-MCP Architecture

This document details the components, data/control flows, and deployment patterns for the Micro-MCP approach introduced by Malik Abualzait (2025).

### Components

- Gateway (Aggregator)
  - Terminates an MCP-compatible client connection
  - Discovers micro-services, merges capabilities, and routes calls by namespace
  - Enforces authentication and policy; emits audit logs and metrics

- Micro-MCP Services (N)
  - Single-responsibility MCP servers exposing tools, resources, and prompts
  - Hold outbound credentials and domain-specific policies

- Registry / Discovery
  - Service metadata: endpoints, transports, versions, capabilities, scopes
  - Static manifest in the MVP; dynamic registry in production

- Observability and Audit
  - Structured logs, request IDs, health checks, and basic metrics

- Identity and Policy
  - Human/app/agent principals; short-lived tokens preferred
  - Scope-based allowlists or contextual policy evaluation

### Flows

1) Startup

1. Gateway reads discovery and config; spawns or attaches to micro-services
2. Gateway builds a capability map keyed by namespace (for example, fs.*, http.fetchText)

2) Request lifecycle

1. Client sends JSON-RPC request to gateway (auth + method + params)
2. Gateway authenticates and authorizes against policy
3. Gateway assigns an internal correlation id and forwards to the target service
4. Service processes and returns a JSON-RPC response
5. Gateway restores the client id and writes response; logs audit entry

3) Error handling

- Standard categories: unauthorized, forbidden, user_error, transient_error, internal_error
- Client backoff/retry; optional circuit-breaking at the gateway

### Deployment Patterns

- Local development: stdio transports, static manifest, hot-reload of services
- Workstation/edge: WebSocket transport, mix of local and remote services
- Cloud: containerized gateway and services; registry + health checks; autoscaling

### Hardening and Productionization

- Authentication: OIDC bearer tokens or mutual TLS between client and gateway
- Policy: declarative policies (for example, Rego/Cedar); consent prompts and purpose binding
- Supply chain: signed images, SBOMs; minimal base images
- Observability: distributed tracing; structured audit with redaction
- Data plane: binary framing and backpressure; streaming for large resources

### Extensibility

- Namespacing: collision avoidance via canonical prefixes per service
- Caching: immutable resources by content hash; signed URLs for large blobs
+- Fan-out: parallelize calls across services with bounded concurrency

### MVP Status (this repo)

- Transport: stdio NDJSON JSON-RPC for simplicity
- Auth/Policy: static token and allowlist in the gateway
- Services: fs, http, vector minimal implementations
- Next: WebSocket transport, dynamic discovery, richer policy, capability catalog endpoints


