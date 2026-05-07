# 0016 Local Git Hooks

## Status

Accepted

## Context

The project forbids GitHub Actions and requires local hooks.

## Decision

Use plain `.githooks/` scripts wired by `make install-hooks`.

Hooks:

- `pre-commit`: run formatting checks, lint, typecheck, and gitleaks if installed.
- `commit-msg`: validate Conventional Commits.
- `pre-push`: run `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout`: remind maintainers to refresh dependencies when package metadata changes.

## Consequences

- Checks are local and visible.
- Missing optional tools produce clear installation guidance where reasonable.

## Alternatives Considered

- Lefthook: good option, but plain hooks avoid another dependency for a small Mode A app.
