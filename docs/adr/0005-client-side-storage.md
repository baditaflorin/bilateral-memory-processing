# 0005 Client-Side Storage Strategy

## Status

Accepted

## Context

The app must preserve privacy while allowing users to keep a private session note if they choose.

## Decision

Use IndexedDB for explicitly saved sessions. Audio blobs are temporary by default and are not persisted unless a future ADR introduces an opt-in audio vault.

Saved records include:

- session id
- timestamps and duration
- distress ratings
- transcript text if the user chooses to keep it
- reflection summary
- pacing events

## Consequences

- Sessions stay local to the browser profile.
- Clearing browser data removes saved sessions.
- Cross-device sync is out of scope for v1.

## Alternatives Considered

- `localStorage`: rejected for size and ergonomics.
- OPFS: useful for large audio vaults, but v1 does not persist recordings.
- Server sync: rejected under ADR 0001.
