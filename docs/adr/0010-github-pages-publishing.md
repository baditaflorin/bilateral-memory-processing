# 0010 GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live Pages URL is a first-class deliverable from the first commit.

## Decision

Publish from `main` branch `/docs`.

Build configuration:

- Vite `base` is `/bilateral-memory-processing/`.
- `npm run build` emits to `docs/`.
- `docs/404.html` is copied from `docs/index.html` for SPA fallback.
- `docs/.nojekyll` is committed.
- `docs/` is not gitignored.

Live URL:

https://baditaflorin.github.io/bilateral-memory-processing/

## Consequences

- Pages can serve the app without Actions.
- Build output is committed intentionally.
- Cache busting is handled by Vite hashed assets.

## Alternatives Considered

- `gh-pages` branch: rejected to keep local hooks and generated Pages output visible on `main`.
- Root publishing: rejected because source files would mix with built assets.
