# 0011 Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser console output can accidentally expose sensitive user content.

## Decision

Production builds avoid logging session content. Development-only diagnostics may log adapter state, never transcript or recording data.

User-facing errors appear in the UI as concise, non-sensitive messages.

## Consequences

- No production console noise is expected.
- Troubleshooting sensitive failures relies on user-described symptoms rather than logs containing private material.

## Alternatives Considered

- Client telemetry: rejected by default under ADR 0012.
