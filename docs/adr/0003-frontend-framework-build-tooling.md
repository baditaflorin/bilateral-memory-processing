# 0003 Frontend Framework and Build Tooling

## Status

Accepted

## Context

The app needs a robust interactive interface, strict typing, static builds for GitHub Pages, workers, tests, and accessible controls.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, Vitest, and Playwright.

Supporting libraries:

- `zod` for persisted-session validation.
- `@tanstack/react-query` for cached async local adapter state.
- `comlink` for worker RPC.
- `lucide-react` for familiar icon controls.

## Consequences

- Builds are fast and static.
- The app can ship to `/docs` with hashed assets and a Pages base path.
- TypeScript catches state and adapter contract errors early.

## Alternatives Considered

- Vanilla TypeScript: viable but slower to build a polished guided workflow.
- Next.js: unnecessary because no server runtime or SSR is required.
