## Security Policy

This repository includes an MVP intended for demonstration and education. It is not production-hardened.

### Scope and caveats

- Gateway uses a static token and a simple allowlist for authorization.
- Services run with local process privileges and may access your filesystem or network depending on configuration.
- Do not run untrusted services; review code before enabling them.

### Reporting

If you discover a security issue, please open a private issue or contact the repository owner. Avoid sharing exploit details publicly until a fix is available.

### Future hardening (roadmap)

- Stronger auth (OIDC/mTLS), contextual policy, sandboxing, and signed artifacts.
- Redaction, purpose binding, and auditable logs with tamper evidence.


