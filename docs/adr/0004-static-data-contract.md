# 0004 Static Data Contract

## Status

Accepted

## Context

Mode A has no generated shared data, but the app still needs static metadata and optional model configuration.

## Decision

Use build-time static metadata exposed through Vite env vars:

- `VITE_APP_VERSION`
- `VITE_COMMIT_SHA`
- `VITE_REPOSITORY_URL`
- `VITE_PAYPAL_URL`

No user session content is part of static data. Optional model downloads use public package/model URLs controlled by the browser-side adapters.

## Consequences

- Version and commit can be displayed on the GitHub Pages site.
- There is no data freshness UI because there is no shared data pipeline.
- No Mode B artifacts are needed.

## Alternatives Considered

- Static JSON manifest: unnecessary for four build-time values.
- Mode B artifact pipeline: rejected in ADR 0001.
