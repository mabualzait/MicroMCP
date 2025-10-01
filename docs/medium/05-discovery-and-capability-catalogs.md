## Discovery and Capability Catalogs for Micro‑MCP

By Malik Abualzait

### Why catalogs matter

LLMs and agents need to know what they can do. A capability catalog lists namespaces, methods, schemas, and policies so clients can plan safely.

### Discovery patterns

- Static manifest (MVP): JSON/YAML listing services and transports
- Dynamic registry: health, version negotiation, and metadata
- Well‑known endpoints: `/.well-known/mcp-services` for bootstrap

### What to publish

- Namespaces and method names
- JSON‑Schemas for inputs/outputs + examples
- Policy requirements (scopes, consent prompts)
- Stability and deprecation status

### Governance

- Namespacing rules and linting to avoid collisions
- Review process for new capabilities and breaking changes

### Future profile (proposal)

- "MCP Discovery Profile": standard JSON for catalogs and registry semantics

### Checklist

```text
- [ ] Manifest/registry live; health checks
- [ ] Schemas and examples published
- [ ] Policy metadata exposed
- [ ] Namespacing rules enforced
```




