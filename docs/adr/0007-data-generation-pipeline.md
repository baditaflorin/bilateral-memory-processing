# 0007 Data Generation Pipeline

## Status

Accepted

## Context

Mode B would require offline or scheduled data generation. This app is Mode A.

## Decision

Do not implement a data generation pipeline in v1.

## Consequences

- `make data` is documented as not applicable.
- There are no committed or release-hosted data artifacts.

## Alternatives Considered

- Generate bundled model manifests: unnecessary until the project hosts its own model artifacts.
