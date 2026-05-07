# Privacy

This project is designed for private browser-local sessions.

## What Stays Local

- Microphone audio
- Transcript text
- Reflection notes
- Distress ratings
- Session timeline events
- Saved session records in IndexedDB

## Network Behavior

The app may fetch static JavaScript, CSS, and optional model files. The app does not upload recordings, transcripts, notes, or distress ratings.

There is no analytics script, tracking beacon, account system, or runtime backend in v1.

## Storage

Sessions are saved only when the user explicitly chooses to save them. Saved sessions live in IndexedDB in the current browser profile. Clearing site data removes them.

## Safety

This app is not clinical treatment, diagnosis, emergency support, or a replacement for a licensed professional. If someone is in immediate danger, they should contact local emergency services.
