# 0017 Dependency Policy

## Status

Accepted

## Context

Mental health adjacent software needs boring, inspectable, maintained dependencies.

## Decision

Use production-ready libraries with active maintenance and permissive licenses where possible.

Policies:

- Prefer stable browser APIs and mature libraries over custom implementations.
- Keep heavy AI libraries lazy-loaded.
- Run `npm audit` before release and fix high or critical findings.
- Avoid dependencies that require runtime secrets or server proxies.

## Consequences

- The app remains auditable and static.
- Some advanced local model behavior may be browser-limited until WebGPU/WASM support improves.

## Alternatives Considered

- Custom model runtimes: rejected.
- Cloud APIs for convenience: rejected because they conflict with privacy goals.
