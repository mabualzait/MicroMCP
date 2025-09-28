## Micro‑MCP Gateway (v0)

Purpose: terminate a single MCP client connection and aggregate capabilities from multiple micro‑MCP services via static discovery.

v0 Goals:

- Static discovery manifest (YAML/JSON)
- Connect to services over stdio and/or WebSocket
- Merge and namespace capabilities; proxy tool/resource calls
- Minimal auth (static token) and basic audit log

Planned files:

- `discovery.example.yaml` – example manifest listing services and transports
- `gateway.config.example.json` – example config with auth and logging options


