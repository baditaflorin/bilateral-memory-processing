# 0014 Error Handling Conventions

## Status

Accepted

## Context

Model and media APIs fail for many normal reasons: permissions, unsupported browsers, model download failures, and low device resources.

## Decision

Use typed result objects for domain operations and user-safe error messages in the UI.

Rules:

- Never expose stack traces to users.
- Never include transcript or memory text in error messages.
- Keep the core manual-guided session usable when AI adapters fail.
- Ask users to pause or stop when distress ratings remain high.

## Consequences

- Failures degrade into manual guidance instead of a blank app.
- Debugging details stay out of production UI and console output.

## Alternatives Considered

- Throw through React boundaries for all errors: rejected because users need recoverable local controls.
