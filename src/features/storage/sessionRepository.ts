import { openDB, type DBSchema } from "idb";
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

async function database() {
  return openDB<SessionDb>(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore("sessions", { keyPath: "id" });
      store.createIndex("by-created", "createdAt");
    }
  });
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
  const sessions = await db.getAll("sessions");
  return sessions
    .map((session) => SavedSessionSchema.parse(session))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function deleteSession(id: string) {
  const db = await database();
  await db.delete("sessions", id);
}

export async function clearSessions() {
  const db = await database();
  await db.clear("sessions");
}
