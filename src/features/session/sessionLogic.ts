import type { Guidance, PaceMetrics, SessionPhase } from "./sessionTypes";

const WORD_PATTERN = /[\p{L}\p{N}']+/gu;

/**
 * Hash a short string into a small integer. Used purely to pick which
 * variation of a guidance block to emit; the output is intentionally
 * deterministic so the same transcript at the same point in a session
 * always produces the same advice — clinical contexts can't tolerate
 * non-reproducible suggestions.
 */
function variationIndex(seed: string, choices: number): number {
  if (choices <= 1) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % choices;
}

interface GuidanceVariant {
  headline: string;
  body: string;
  prompts: string[];
}

function pickVariant(seed: string, variants: GuidanceVariant[]): GuidanceVariant {
  const variant = variants[variationIndex(seed, variants.length)];
  if (!variant) {
    // Defensive — the caller always passes a non-empty array, but if
    // a future refactor empties one we'd rather throw early than emit
    // an undefined-prompted guidance card.
    throw new Error("pickVariant called with an empty variants array");
  }
  return variant;
}

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

// Each branch ships several deterministic variants — the same transcript +
// phase always produces the same variant, but different sessions get
// different phrasing. This is intentional: clinical advice must be
// reproducible, and a four-template loop felt repetitive across users.

const OVERLOADED_VARIANTS: GuidanceVariant[] = [
  {
    headline: "Pause and orient to the room",
    body: "Your distress rating moved into a high range. Stop memory detail for now and come back to the present.",
    prompts: [
      "Name five neutral things you can see.",
      "Lower the tone volume or stop it.",
      "Let the memory become a still image instead of a scene."
    ]
  },
  {
    headline: "Stop the memory work and slow down",
    body: "Distress is high. The memory will still be there once the room feels available again.",
    prompts: [
      "Press both feet into the floor and notice the pressure.",
      "Drink water or splash a little on your wrists.",
      "Look at one object across the room and describe its colour."
    ]
  },
  {
    headline: "Step out of the memory for now",
    body: "We pause whenever the rating spikes. There is no penalty for stopping early.",
    prompts: [
      "Say your name and today's date out loud.",
      "Notice three sounds happening in the room right now.",
      "Take one full slow exhale before you decide what to do next."
    ]
  }
];

const FAST_VARIANTS: GuidanceVariant[] = [
  {
    headline: "Slow the pace before continuing",
    body: "The session has been moving quickly. A short pause can help keep the memory workable.",
    prompts: [
      "Take two slower breaths with your eyes open.",
      "Notice where your feet or chair make contact.",
      "Resume with one small detail rather than the whole memory."
    ]
  },
  {
    headline: "Take a breath before the next sentence",
    body: "Pace was high — that is fine, but the next pass goes better when the body settles first.",
    prompts: [
      "Pause for ten seconds and say nothing.",
      "Soften your jaw and shoulders deliberately.",
      "Pick one detail to revisit rather than the whole arc."
    ]
  },
  {
    headline: "Drop the speed by half on the next pass",
    body: "Fast narration sometimes outruns what the body can integrate. Slowing the words gives the system time to catch up.",
    prompts: [
      "Notice whether your breathing has shortened.",
      "Place a hand on something warm or grounding.",
      "Start the next sentence at half the previous pace."
    ]
  }
];

const ACTIVATED_VARIANTS: GuidanceVariant[] = [
  {
    headline: "Stay within the activation window",
    body: "Your rating is up but workable. Keep the memory small and the present available.",
    prompts: [
      "Hold one detail in mind rather than the whole memory.",
      "Check that you can still hear and see the room.",
      "Let the bilateral tones do the work — you do not need to push."
    ]
  },
  {
    headline: "Notice the activation without amplifying it",
    body: "Activation is information, not danger. You can stay with it as long as the present is still in the room with you.",
    prompts: [
      "Name one sensation in your body without judging it.",
      "Keep both eyes open while you describe the memory.",
      "If the rating climbs another point, take a 30-second break."
    ]
  }
];

const REVISIT_VARIANTS: GuidanceVariant[] = [
  {
    headline: "Revisit one piece gently",
    body: "You have enough settling time to touch the memory again without rushing the whole story.",
    prompts: [
      "What is the least intense part of the memory that still feels true?",
      "What changed in your body since the first pass?",
      "What would help you keep one foot in the present?"
    ]
  },
  {
    headline: "Return to a single slice of the memory",
    body: "The earlier pause gave you room. A second pass can be deliberately smaller than the first.",
    prompts: [
      "Pick one image or one sentence from the memory — no more.",
      "Notice whether anything about it has softened.",
      "End the pass when you notice your breath returning."
    ]
  }
];

const CLOSE_VARIANTS: GuidanceVariant[] = [
  {
    headline: "Close the session",
    body: "Your rating is low enough to wrap the exercise and leave the memory alone for now.",
    prompts: [
      "Write one sentence about what feels different.",
      "Choose a grounding action for the next ten minutes.",
      "Save only what you genuinely want to keep."
    ]
  },
  {
    headline: "Let the session land",
    body: "The work for today is done. Closing well is part of the practice — don't skip the landing.",
    prompts: [
      "Stand up and move for thirty seconds before you leave the screen.",
      "Name one thing that felt usable today.",
      "Decide whether to keep the recording or delete it now."
    ]
  }
];

const DEFAULT_VARIANTS: GuidanceVariant[] = [
  {
    headline: "Continue in a narrow window",
    body: "Stay with a small slice of the memory and keep checking whether the present room remains available.",
    prompts: [
      "Say what happened in short phrases.",
      "Pause if the rating climbs by two points.",
      "Notice any neutral or safe detail that exists now."
    ]
  },
  {
    headline: "Keep the slice small",
    body: "Smaller passes through the memory beat one long pass. The room you are in right now is part of the work.",
    prompts: [
      "Describe one moment, then stop and notice the room.",
      "Speak slowly enough to hear your own voice.",
      "Take a sip of water between segments."
    ]
  }
];

export function buildLocalGuidance(input: {
  transcript: string;
  phase: SessionPhase;
  metrics: PaceMetrics;
}): Guidance {
  const recommendedPhase = nextPhase(input.phase, input.metrics);
  // Seed the variation on the transcript length and phase — the same
  // session always picks the same variant at the same point, but
  // different sessions get different phrasings.
  const seed = `${input.phase}|${recommendedPhase}|${input.metrics.status}|${input.transcript.length}`;

  if (input.metrics.status === "overloaded") {
    const variant = pickVariant(seed, OVERLOADED_VARIANTS);
    return {
      ...variant,
      recommendedPhase: "pause",
      safetyNote:
        "If you feel unsafe or at risk of harming yourself or someone else, contact local emergency services now."
    };
  }

  if (input.metrics.status === "fast") {
    return { ...pickVariant(seed, FAST_VARIANTS), recommendedPhase: "pause" };
  }

  // Explicit branch for activated state, which previously fell through
  // to the generic default. Activation is the most common in-session
  // state and deserves its own coaching.
  if (input.metrics.status === "activated") {
    return { ...pickVariant(seed, ACTIVATED_VARIANTS), recommendedPhase };
  }

  if (recommendedPhase === "revisit") {
    return { ...pickVariant(seed, REVISIT_VARIANTS), recommendedPhase };
  }

  if (recommendedPhase === "close") {
    return { ...pickVariant(seed, CLOSE_VARIANTS), recommendedPhase };
  }

  return { ...pickVariant(seed, DEFAULT_VARIANTS), recommendedPhase };
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
