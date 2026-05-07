# 0013 Testing Strategy

## Status

Accepted

## Context

The app has safety-sensitive session logic and browser APIs that need smoke coverage.

## Decision

Use:

- Vitest for pure TypeScript unit tests.
- Playwright for one happy-path browser test.
- `scripts/smoke.sh` to build, serve `docs/`, and run Playwright.
- `make test` and `make smoke` as the local verification entry points.

## Consequences

- Pure logic receives fast coverage.
- Browser media permissions are tested through mocked APIs rather than real microphone hardware in CI-like local runs.

## Alternatives Considered

- GitHub Actions: rejected by project constraint.
- Manual smoke only: rejected because the guided flow should not regress silently.
