# 0001 Deployment Mode

## Status

Accepted

## Context

The product promise is that difficult memories, recordings, transcripts, and reflections are not uploaded to an application server. The app needs Web Audio bilateral stimulation, microphone recording, browser-local transcription, browser-local reflection prompts, client storage, and static publishing.

## Decision

Use Mode A: Pure GitHub Pages. The runtime is a static Vite application served from `main` branch `/docs`.

All sensitive processing runs in the browser:

- Web Audio handles bilateral tones.
- MediaRecorder captures local microphone audio.
- Whisper is lazy-loaded with browser-side model execution through `@huggingface/transformers`.
- Local reflection uses an in-browser rules engine first and can lazy-load WebLLM when supported.
- Piper TTS is lazy-loaded through a browser WASM package when the user asks for spoken guidance.
- IndexedDB stores private session notes only after an explicit save action.

## Consequences

- No runtime backend, database, Docker image, nginx, server metrics, or server secrets are needed in v1.
- Heavy model assets are lazy-loaded after user action so the initial app shell remains small.
- GitHub Pages cannot set COOP/COEP headers, so model features must degrade gracefully when a browser requires isolation for a specific backend.
- Static model fetches may occur from public model CDNs, but user session content is never sent by the app.

## Alternatives Considered

- Mode B: Not needed because there is no shared precomputed data pipeline.
- Mode C: Rejected because a runtime backend would weaken the privacy promise and is unnecessary for v1.
