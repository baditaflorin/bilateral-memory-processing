import type { Guidance, PaceMetrics, SessionPhase } from "./sessionTypes";

const WORD_PATTERN = /[\p{L}\p{N}']+/gu;

export function countWords(text: string) {
  return text.match(WORD_PATTERN)?.length ?? 0;
}

export function assessPace(input: {
  transcript: string;
  durationSeconds: number;
  pauseCount: number;
  secondsSincePause: number;
  distressBefore: number;
  distressNow: number;
}): PaceMetrics {
  const words = countWords(input.transcript);
  const durationMinutes = Math.max(input.durationSeconds / 60, 0.25);
  const wordsPerMinute = Math.round(words / durationMinutes);
  const distressDelta = input.distressNow - input.distressBefore;

  let status: PaceMetrics["status"] = "settled";
  if (input.distressNow >= 8 || distressDelta >= 3) {
    status = "overloaded";
  } else if (wordsPerMinute >= 150 || input.secondsSincePause >= 210) {
    status = "fast";
  } else if (input.distressNow >= 5 || distressDelta >= 1) {
    status = "activated";
  }

  return {
    durationSeconds: input.durationSeconds,
    words,
    wordsPerMinute,
    pauseCount: input.pauseCount,
    secondsSincePause: input.secondsSincePause,
    distressNow: input.distressNow,
    distressDelta,
    status
  };
}

export function nextPhase(current: SessionPhase, metrics: PaceMetrics): SessionPhase {
  if (metrics.status === "overloaded" || metrics.secondsSincePause >= 240) {
    return "pause";
  }
  if (current === "settle") {
    return "record";
  }
  if (current === "record" && metrics.pauseCount > 0 && metrics.status === "settled") {
    return "revisit";
  }
  if (current === "revisit" && metrics.distressNow <= 3 && metrics.durationSeconds >= 240) {
    return "close";
  }
  return current;
}

export function buildLocalGuidance(input: {
  transcript: string;
  phase: SessionPhase;
  metrics: PaceMetrics;
}): Guidance {
  const recommendedPhase = nextPhase(input.phase, input.metrics);

  if (input.metrics.status === "overloaded") {
    return {
      headline: "Pause and orient to the room",
      body: "Your distress rating moved into a high range. Stop memory detail for now and come back to the present.",
      prompts: [
        "Name five neutral things you can see.",
        "Lower the tone volume or stop it.",
        "Let the memory become a still image instead of a scene."
      ],
      recommendedPhase: "pause",
      safetyNote:
        "If you feel unsafe or at risk of harming yourself or someone else, contact local emergency services now."
    };
  }

  if (input.metrics.status === "fast") {
    return {
      headline: "Slow the pace before continuing",
      body: "The session has been moving quickly. A short pause can help keep the memory workable.",
      prompts: [
        "Take two slower breaths with your eyes open.",
        "Notice where your feet or chair make contact.",
        "Resume with one small detail rather than the whole memory."
      ],
      recommendedPhase: "pause"
    };
  }

  if (recommendedPhase === "revisit") {
    return {
      headline: "Revisit one piece gently",
      body: "You have enough settling time to touch the memory again without rushing the whole story.",
      prompts: [
        "What is the least intense part of the memory that still feels true?",
        "What changed in your body since the first pass?",
        "What would help you keep one foot in the present?"
      ],
      recommendedPhase
    };
  }

  if (recommendedPhase === "close") {
    return {
      headline: "Close the session",
      body: "Your rating is low enough to wrap the exercise and leave the memory alone for now.",
      prompts: [
        "Write one sentence about what feels different.",
        "Choose a grounding action for the next ten minutes.",
        "Save only what you genuinely want to keep."
      ],
      recommendedPhase
    };
  }

  return {
    headline: "Continue in a narrow window",
    body: "Stay with a small slice of the memory and keep checking whether the present room remains available.",
    prompts: [
      "Say what happened in short phrases.",
      "Pause if the rating climbs by two points.",
      "Notice any neutral or safe detail that exists now."
    ],
    recommendedPhase
  };
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
