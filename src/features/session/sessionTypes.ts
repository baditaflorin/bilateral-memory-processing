export type SessionPhase = "settle" | "record" | "pause" | "revisit" | "close";

export interface ToneSettings {
  readonly frequency: number;
  readonly intervalMs: number;
  readonly volume: number;
  readonly wave: OscillatorType;
}

export interface DistressRating {
  readonly before: number;
  readonly now: number;
  readonly after: number;
}

export interface SessionEvent {
  readonly id: string;
  readonly at: string;
  readonly label: string;
  readonly type: "tone" | "recording" | "pause" | "reflection" | "save" | "safety";
}

export interface PaceMetrics {
  readonly durationSeconds: number;
  readonly words: number;
  readonly wordsPerMinute: number;
  readonly pauseCount: number;
  readonly secondsSincePause: number;
  readonly distressNow: number;
  readonly distressDelta: number;
  readonly status: "settled" | "activated" | "fast" | "overloaded";
}

export interface Guidance {
  readonly headline: string;
  readonly body: string;
  readonly prompts: string[];
  readonly recommendedPhase: SessionPhase;
  readonly safetyNote?: string;
}

export interface ReflectionInput {
  readonly transcript: string;
  readonly phase: SessionPhase;
  readonly metrics: PaceMetrics;
  readonly useWebLlm: boolean;
}

export interface ReflectionResult {
  readonly guidance: Guidance;
  readonly source: "local-rules" | "web-llm";
}
