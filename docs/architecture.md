# Architecture

Live site:

https://baditaflorin.github.io/bilateral-memory-processing/

Repository:

https://github.com/baditaflorin/bilateral-memory-processing

## Context

```mermaid
flowchart LR
  user["User\nRuns a private guided memory-processing session"]
  site["GitHub Pages App\nStatic browser application"]
  models["Public Model Assets\nOptional Whisper/WebLLM/Piper files"]

  user -->|"uses in browser"| site
  site -->|"fetches optional model files only"| models
```

## Container

```mermaid
flowchart TB
  pages["GitHub Pages\nStatic hosting"]
  modelcdn["Public Model CDNs\nStatic model files"]

  subgraph browser["User Browser"]
    ui["React UI\nSession flow, safety copy, controls"]
    audio["Audio Engine\nWeb Audio, MediaRecorder, WAV export"]
    ai["Local AI Workers\nWhisper, WebLLM/rules, Piper"]
    idb[("IndexedDB\nExplicitly saved private sessions")]
  end

  pages -->|"serves static app"| ui
  ui -->|"starts tones and recording"| audio
  ui -->|"requests local transcript, reflection, voice"| ai
  ui -->|"saves only on user action"| idb
  ai -->|"downloads model assets only"| modelcdn
```

The GitHub Pages boundary contains static HTML, CSS, JS, and assets only. Sensitive session content stays inside the user browser.
