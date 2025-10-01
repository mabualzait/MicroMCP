## Security by Design: Least‑Privilege and Audit in Micro‑MCP

By Malik Abualzait

### Threats we care about

- Over‑permissive capabilities (wildcard fetchers, full FS access)
- Prompt abuse leading to unintended tool execution
- Credential leakage and replay
- Service compromise and lateral movement

### Controls

- Gateway: identity (OIDC/mTLS), allowlists/scopes, consent prompts (high‑risk), structured audit
- Services: domain‑scoped credentials, read‑only FS, domain allowlists, IO validation, redaction
- Platform: SBOMs, signed images, network policies, secret managers

![Security Flow](../../images/Security%20%26%20policy%20flow.png)

### Audit that matters

- Log who/what/when/where: principal, method, decision, latency, result category
- Redact sensitive fields; never log secrets
- Make logs tamper‑evident in regulated environments

### Checklist

```text
- [ ] Auth configured (OIDC or mTLS)
- [ ] Allowlist/scopes per method
- [ ] Consent prompts for destructive tools
- [ ] Redaction for PII; secure audit storage
- [ ] Short‑lived credentials; rotation policies
```




