# 0015 Deployment Topology

## Status

Accepted

## Context

Mode A deployment is GitHub Pages only.

## Decision

Deploy only the static app from GitHub Pages:

https://baditaflorin.github.io/bilateral-memory-processing/

No Docker, nginx, compose, Prometheus, or server runbook is required for v1.

## Consequences

- Rollback is a git revert of the Pages publishing commit.
- Availability is delegated to GitHub Pages and public model CDNs used by optional adapters.

## Alternatives Considered

- Docker backend on port 25342: rejected under ADR 0001.
