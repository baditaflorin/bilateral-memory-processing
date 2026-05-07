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
});
