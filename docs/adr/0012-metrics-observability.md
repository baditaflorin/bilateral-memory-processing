# 0012 Metrics and Observability

## Status

Accepted

## Context

The privacy promise is stronger if the app has no analytics by default.

## Decision

Ship with no analytics, no beacons, and no server metrics.

Local UI status indicators show:

- current session phase
- recording/tone/model readiness
- saved session count
- app version and commit

## Consequences

- Maintainers do not get usage metrics.
- Users can inspect network traffic and see no session telemetry from the app.

## Alternatives Considered

- Plausible analytics: rejected for v1 because adoption metrics are less important than trust.
