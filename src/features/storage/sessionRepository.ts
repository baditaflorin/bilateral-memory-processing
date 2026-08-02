import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { z } from "zod";
import type { DistressRating, Guidance, SessionEvent, ToneSettings } from "../session/sessionTypes";

const SavedSessionSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  durationSeconds: z.number().nonnegative(),
  transcript: z.string(),
  guidance: z
    .object({
      headline: z.string(),
      body: z.string(),
      prompts: z.array(z.string()),
      recommendedPhase: z.enum(["settle", "record", "pause", "revisit", "close"]),
      safetyNote: z.string().optional()
    })
    .optional(),
  distress: z.object({
    before: z.number(),
    now: z.number(),
    after: z.number()
  }),
  toneSettings: z.object({
    frequency: z.number(),
    intervalMs: z.number(),
    volume: z.number(),
    wave: z.enum(["sine", "square", "sawtooth", "triangle"])
  }),
  events: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      label: z.string(),
      type: z.enum(["tone", "recording", "pause", "reflection", "save", "safety"])
    })
  )
});

export type SavedSession = z.infer<typeof SavedSessionSchema>;

interface SessionDb extends DBSchema {
  sessions: {
    key: string;
    value: SavedSession;
    indexes: {
      "by-created": string;
    };
  };
}

const DB_NAME = "bilateral-memory-processing";

// Reuse a single connection instead of opening a new one on every call.
// Each openDB() call left an IDBDatabase handle open forever (no caller
// ever closed it), so a session that saved, listed, and deleted a few
// times accumulated one live connection per call. That is a memory leak
// in its own right, and every one of those stale connections would also
// block a future onupgradeneeded (schema version bump) from ever
// resolving in this tab until it was reloaded.
let dbPromise: Promise<IDBPDatabase<SessionDb>> | null = null;

async function database() {
  dbPromise ??= openDB<SessionDb>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore("sessions", { keyPath: "id" });
      store.createIndex("by-created", "createdAt");
    }
  });
  return dbPromise;
}

export async function saveSession(input: {
  readonly transcript: string;
  readonly guidance?: Guidance;
  readonly durationSeconds: number;
  readonly distress: DistressRating;
  readonly toneSettings: ToneSettings;
  readonly events: SessionEvent[];
}) {
  const now = new Date().toISOString();
  const session = SavedSessionSchema.parse({
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...input
  });
  const db = await database();
  await db.put("sessions", session);
  return session;
}

export async function listSessions() {
  const db = await database();
  const rows = await db.getAll("sessions");

  // Validate each row independently. Previously this used
  // SavedSessionSchema.parse() inside the .map(), which throws on the
  // first row that does not match the current schema — for example a
  // record written by an older or newer build, or one with any field
  // drift. That made the *entire* listSessions() call reject, and the
  // caller (SessionApp: `sessions={savedSessionsQuery.data ?? []}`)
  // rendered "Nothing has been saved in this browser," indistinguishable
  // from real data loss, even though every session — the malformed one
  // included — was still intact in IndexedDB. A single bad row must not
  // hide every other private journal entry from the user.
  const sessions: SavedSession[] = [];
  for (const row of rows) {
    const result = SavedSessionSchema.safeParse(row);
    if (result.success) {
      sessions.push(result.data);
    } else {
      console.warn(
        "Skipping a saved session that no longer matches the current schema. It has not been deleted.",
        result.error
      );
    }
  }

  return sessions.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function deleteSession(id: string) {
  const db = await database();
  await db.delete("sessions", id);
}

export async function clearSessions() {
  const db = await database();
  await db.clear("sessions");
}
