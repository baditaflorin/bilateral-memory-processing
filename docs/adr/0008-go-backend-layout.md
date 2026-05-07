# 0008 Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap standard describes a Go backend for Modes B and C.

## Decision

Skip Go backend layout in v1 because ADR 0001 selects Mode A.

## Consequences

- No `cmd/`, `internal/`, `pkg/`, `api/`, `configs/`, or Go module is created.
- No Docker backend image is built.
- Backend-specific hook checks are omitted.

## Alternatives Considered

- Add an empty Go module for future use: rejected to avoid misleading maintenance burden.
