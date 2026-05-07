# Architecture

Live site:

https://baditaflorin.github.io/bilateral-memory-processing/

Repository:

https://github.com/baditaflorin/bilateral-memory-processing

## Context

```mermaid
C4Context
  title Bilateral Memory Processing
  Person(user, "User", "Runs a private guided memory-processing session")
  System(site, "GitHub Pages App", "Static browser application")
  System_Ext(models, "Public Model Assets", "Optional Whisper/WebLLM/Piper assets fetched by browser")
  Rel(user, site, "Uses in browser")
  Rel(site, models, "Fetches optional model files; sends no session content")
```

## Container

```mermaid
C4Container
  title Mode A Static Architecture
  Person(user, "User")
  Container_Boundary(browser, "User Browser") {
    Container(ui, "React UI", "TypeScript", "Session flow, safety copy, controls")
    Container(audio, "Audio Engine", "Web Audio + MediaRecorder", "Bilateral tones, recording, WAV export")
    Container(ai, "Local AI Workers", "Web Workers", "Whisper, WebLLM/rules, Piper")
    ContainerDb(idb, "IndexedDB", "Browser storage", "Explicitly saved private sessions")
  }
  System_Ext(pages, "GitHub Pages", "Static hosting")
  System_Ext(modelcdn, "Public Model CDNs", "Static model files")
  Rel(user, ui, "Interacts")
  Rel(pages, ui, "Serves static app")
  Rel(ui, audio, "Starts tones and recording")
  Rel(ui, ai, "Requests local transcript/reflection/voice")
  Rel(ui, idb, "Saves only on user action")
  Rel(ai, modelcdn, "Downloads model assets only")
```

The GitHub Pages boundary contains static HTML, CSS, JS, and assets only. Sensitive session content stays inside the user browser.
