# 0009 Configuration and Secrets Management

## Status

Accepted

## Context

The frontend must never contain secrets. The app needs public URLs and build metadata only.

## Decision

Use Vite env vars for public build-time values. Commit `.env.example` with placeholders and ignore real `.env` files.

No API keys, tokens, passwords, private keys, private model URLs, or internal hosts are allowed in git.

## Consequences

- Configuration is transparent and safe to publish.
- Any future secret-requiring feature must move to an offline pipeline or a new Mode C ADR.

## Alternatives Considered

- Encrypted frontend secrets: rejected because browser-delivered secrets are not secrets.
