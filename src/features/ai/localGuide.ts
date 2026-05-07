import { buildLocalGuidance } from "../session/sessionLogic";
import type { ReflectionInput, ReflectionResult } from "../session/sessionTypes";

export function generateLocalReflection(input: ReflectionInput): ReflectionResult {
  const guidance = buildLocalGuidance({
    transcript: input.transcript,
    phase: input.phase,
    metrics: input.metrics
  });

  return {
    guidance,
    source: "local-rules"
  };
}
