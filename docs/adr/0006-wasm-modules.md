# 0006 WASM and Local Model Modules

## Status

Accepted

## Context

The app references Web Audio, libsndfile, a local LLM, Piper, and Whisper. Browser deployment constrains what can run reliably from GitHub Pages.

## Decision

Use these browser-local adapters:

- Whisper: `@huggingface/transformers` for client-side ASR, lazy-loaded in a worker.
- Local LLM: `@mlc-ai/web-llm` when WebGPU and browser isolation requirements allow it, with a deterministic local guide as fallback.
- Piper: `piper-tts-web`, lazy-loaded only when the user requests spoken guidance.
- libsndfile: no maintained production browser `libsndfile` WASM package was selected for v1. The app captures with MediaRecorder and exports 16-bit PCM WAV in a libsndfile-compatible format.

## Consequences

- Heavy model paths do not affect the initial app shell.
- Transcription and local LLM features depend on browser capability and model download success.
- The app remains useful through local deterministic guidance when AI adapters are unavailable.

## Alternatives Considered

- Bundle model files in the repo: rejected because model artifacts are too large for a small Pages app.
- Runtime backend inference: rejected because it would upload sensitive content.
- Hand-roll speech recognition: rejected because Whisper is the battle-tested option.
