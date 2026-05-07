# Postmortem

## What Was Built

Version 0.1.0 implements a Mode A GitHub Pages app for private bilateral audio journaling:

- Web Audio left/right tone engine with adjustable frequency, pace, and volume.
- Local microphone recording with MediaRecorder.
- Distress ratings, pace metrics, pause tracking, and phase suggestions.
- Local reflection worker with deterministic guidance and optional WebLLM path.
- Local Whisper worker path through `@huggingface/transformers`.
- Piper voice guidance adapter through `piper-tts-web`.
- IndexedDB saves for explicit private session notes.
- GitHub and PayPal links in the live page.
- Version and commit display in the live page.
- Local hooks, unit tests, smoke test, ADRs, deploy docs, privacy docs, and screenshot.

## Was Mode A Correct?

Yes. The core promise is that trauma recordings and transcripts are not uploaded to an app server. Web Audio, MediaRecorder, browser workers, IndexedDB, Whisper, WebLLM, and Piper can all fit a static GitHub Pages deployment. A Mode C backend would add privacy risk without solving a v1 requirement.

## What Worked

- GitHub Pages from `main` `/docs` was configured immediately.
- Local deterministic guidance keeps the product useful even when heavy model adapters are unavailable.
- The app shell remains small; heavy AI and TTS code is lazy-loaded behind user action.
- The smoke test can exercise the main static app path without microphone hardware.

## What Did Not Work

- Publishing from `docs/` while storing ADRs in `docs/adr/` required a custom clean step. A normal Vite empty output directory deleted documentation until the build was adjusted.
- Piper and ONNX assets are large. They remain lazy-loaded, but the repository and Pages artifact are heavier than ideal.
- Browser WebLLM support still depends on WebGPU and model runtime constraints.

## Surprises

- The maintained Piper browser package copies a substantial ONNX/Piper worker runtime into the static site.
- Prettier attempted to format generated bundles until `.prettierignore` excluded Pages assets.

## Accepted Tech Debt

- The local LLM path falls back to deterministic guidance when WebLLM cannot initialize.
- libsndfile is represented by a libsndfile-compatible PCM WAV export rather than a bundled libsndfile WASM module because no maintained production browser package was selected.
- Audio recordings are temporary by default; persistent encrypted audio vaults are left out of v1.

## Next Improvements

1. Add a model settings screen that lets users choose hosted static model URLs or user-supplied local model files.
2. Add an optional encrypted OPFS audio vault with explicit retention controls.
3. Add a browser capability diagnostic that explains Whisper, WebLLM, Piper, and offline support before a session starts.

## Time Spent vs Estimate

Estimated: 2 to 3 focused hours for a polished static v1 scaffold and guided local workflow.

Actual: about 2.5 focused hours, with extra time spent on the `docs/` publishing collision and generated bundle formatting.
