import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { openDB } from "idb";
import {
  clearSessions,
  deleteSession,
  listSessions,
  saveSession
} from "../src/features/storage/sessionRepository";
import type { ToneSettings } from "../src/features/session/sessionTypes";

const DB_NAME = "bilateral-memory-processing";

const BASE_TONE: ToneSettings = { frequency: 440, intervalMs: 650, volume: 0.05, wave: "sine" };

function baseSession(overrides: Record<string, unknown> = {}) {
  return {
    transcript: "a private note",
    durationSeconds: 42,
    distress: { before: 4, now: 3, after: 2 },
    toneSettings: BASE_TONE,
    events: [],
    ...overrides
  };
}

describe("sessionRepository", () => {
  beforeEach(async () => {
    // The repository now holds one long-lived IndexedDB connection for the
    // life of the module, so tearing down between tests goes through the
    // public API rather than indexedDB.deleteDatabase() — deleting the
    // database out from under a live connection would just hang waiting
    // for a close that never happens, in tests and in the real app alike.
    await clearSessions();
  });

  it("saves and lists a session round-trip", async () => {
    await saveSession(baseSession());
    const sessions = await listSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].transcript).toBe("a private note");
  });

  it("does not let one malformed record hide every other saved session", async () => {
    // Two normal sessions saved through the real API.
    await saveSession(baseSession({ transcript: "first entry" }));
    await saveSession(baseSession({ transcript: "second entry" }));

    // Simulate a record that no longer matches the current schema shape —
    // e.g. written by an older/newer build, or partially corrupted by the
    // browser. This bypasses saveSession's own validation to land directly
    // in IndexedDB, mirroring how a real drift would appear on disk.
    const db = await openDB(DB_NAME, 1);
    await db.put("sessions", {
      id: "corrupted-record",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      durationSeconds: 10,
      transcript: "third entry",
      distress: { before: 4, now: 3, after: 2 },
      toneSettings: { frequency: 440, intervalMs: 650, volume: 0.05, wave: "sine" },
      events: [],
      // recommendedPhase is not one of the current five values — this is
      // exactly the kind of drift a schema change or partial write causes.
      guidance: {
        headline: "old",
        body: "old body",
        prompts: [],
        recommendedPhase: "legacy-phase-that-no-longer-exists"
      }
    });
    db.close();

    // The two genuinely valid sessions must still be readable. Before the
    // fix, a single bad record made SavedSessionSchema.parse throw inside
    // the .map(), which made the whole listSessions() call reject — and
    // the UI (SessionApp: `sessions={savedSessionsQuery.data ?? []}`)
    // silently rendered "Nothing has been saved in this browser," even
    // though two real private journal entries were still on disk.
    const sessions = await listSessions();
    const transcripts = sessions.map((session) => session.transcript).sort();
    expect(transcripts).toEqual(["first entry", "second entry"]);
  });

  it("can still delete a valid session after a corrupted record exists", async () => {
    const saved = await saveSession(baseSession({ transcript: "keep me honest" }));

    const db = await openDB(DB_NAME, 1);
    await db.put("sessions", {
      id: "another-corrupted-record",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      durationSeconds: 10,
      transcript: "bad",
      distress: { before: 4, now: 3, after: 2 },
      toneSettings: { frequency: 440, intervalMs: 650, volume: 0.05, wave: "triangle" },
      events: [],
      guidance: {
        headline: "old",
        body: "old body",
        prompts: [],
        recommendedPhase: "nonexistent-phase"
      }
    });
    db.close();

    await deleteSession(saved.id);
    const sessions = await listSessions();
    expect(sessions).toHaveLength(0);
  });
});
