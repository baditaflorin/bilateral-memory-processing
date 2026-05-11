import { describe, expect, it } from "vitest";
import {
  assessPace,
  buildLocalGuidance,
  countWords,
  formatDuration
} from "../src/features/session/sessionLogic";

describe("session logic", () => {
  it("counts words across plain text and contractions", () => {
    expect(countWords("I can't stay with the whole memory. One detail is enough.")).toBe(11);
  });

  it("flags high distress as overloaded", () => {
    const metrics = assessPace({
      transcript: "one small detail",
      durationSeconds: 60,
      pauseCount: 0,
      secondsSincePause: 60,
      distressBefore: 4,
      distressNow: 8
    });

    expect(metrics.status).toBe("overloaded");
  });

  it("recommends a pause when the user is overloaded", () => {
    const metrics = assessPace({
      transcript: "one small detail",
      durationSeconds: 60,
      pauseCount: 0,
      secondsSincePause: 60,
      distressBefore: 4,
      distressNow: 9
    });

    const guidance = buildLocalGuidance({ transcript: "", phase: "record", metrics });
    expect(guidance.recommendedPhase).toBe("pause");
    expect(guidance.safetyNote).toContain("emergency services");
  });

  it("formats durations as mm:ss", () => {
    expect(formatDuration(125.4)).toBe("02:05");
  });

  it("emits activation-specific guidance when the status is activated (previously fell through)", () => {
    const metrics = assessPace({
      transcript: "one small detail and another",
      durationSeconds: 90,
      pauseCount: 0,
      secondsSincePause: 30,
      distressBefore: 4,
      distressNow: 6
    });
    expect(metrics.status).toBe("activated");

    const guidance = buildLocalGuidance({
      transcript: "one small detail and another",
      phase: "record",
      metrics
    });
    // Previously the activated state shared text with the generic
    // default — its body started with "Stay with a small slice". The
    // explicit branch now produces activation-specific phrasing.
    expect(guidance.headline + " " + guidance.body).toMatch(/activation/i);
  });

  it("produces the same guidance for the same transcript (reproducible)", () => {
    const metrics = assessPace({
      transcript: "one small detail",
      durationSeconds: 90,
      pauseCount: 0,
      secondsSincePause: 30,
      distressBefore: 4,
      distressNow: 6
    });

    const a = buildLocalGuidance({
      transcript: "a particular sentence here",
      phase: "record",
      metrics
    });
    const b = buildLocalGuidance({
      transcript: "a particular sentence here",
      phase: "record",
      metrics
    });
    expect(a).toEqual(b);
  });

  it("varies guidance across distinctly different transcripts (no single hard-coded reply)", () => {
    const metrics = assessPace({
      transcript: "short",
      durationSeconds: 90,
      pauseCount: 0,
      secondsSincePause: 30,
      distressBefore: 4,
      distressNow: 6
    });

    // Build a wide range of transcript lengths — the variation seed
    // uses transcript.length, so this is what shifts the bucket.
    const transcripts = Array.from({ length: 50 }, (_, i) => "x".repeat(i + 1));
    const headlines = new Set(
      transcripts.map(
        (t) => buildLocalGuidance({ transcript: t, phase: "record", metrics }).headline
      )
    );
    // Same metrics + status, varying transcript-length seeds → at
    // least two distinct headlines surface (proves the branch has
    // variants instead of the previous single template).
    expect(headlines.size).toBeGreaterThan(1);
  });

  it("attaches a safety note only to the overloaded branch", () => {
    const overloaded = assessPace({
      transcript: "one detail",
      durationSeconds: 60,
      pauseCount: 0,
      secondsSincePause: 30,
      distressBefore: 4,
      distressNow: 9
    });
    const activated = assessPace({
      transcript: "one detail",
      durationSeconds: 60,
      pauseCount: 0,
      secondsSincePause: 30,
      distressBefore: 4,
      distressNow: 6
    });

    expect(
      buildLocalGuidance({ transcript: "", phase: "record", metrics: overloaded }).safetyNote
    ).toBeDefined();
    // Activation gets coaching but not the emergency-services safety
    // note — that prompt is reserved for the overloaded state so the
    // signal doesn't get diluted by repetition.
    expect(
      buildLocalGuidance({ transcript: "", phase: "record", metrics: activated }).safetyNote
    ).toBeUndefined();
  });
});
