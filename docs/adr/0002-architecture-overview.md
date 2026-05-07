# 0002 Architecture Overview and Module Boundaries

## Status

Accepted

## Context

The application needs a clear boundary between the user-facing session flow, local audio capture/playback, local AI adapters, safety copy, and persistence.

## Decision

Use a client-only modular architecture:

- `features/session`: orchestration, pacing, prompts, distress tracking, and UI state.
- `features/audio`: Web Audio bilateral tone engine, recording, analysis, and WAV export helpers.
- `features/ai`: Whisper, WebLLM/rules, and Piper adapters behind local-only interfaces.
- `features/storage`: IndexedDB repository for explicitly saved sessions.
- `shared`: app shell, metadata, error handling, and UI primitives.

Workers isolate long-running transcription and reflection generation from the UI thread.

## Consequences

- The core session loop remains usable if model adapters fail or are unavailable.
- Adapters can be swapped without rewriting the session UI.
- The app keeps a small default load path and lazy-loads expensive code.

## Alternatives Considered

- Single-file prototype: rejected because safety-critical behavior and model adapters would become hard to audit.
- Backend-guided orchestration: rejected under ADR 0001.
