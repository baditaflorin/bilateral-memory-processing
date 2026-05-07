import { expose } from "comlink";
import { generateLocalReflection } from "./localGuide";
import type { ReflectionInput, ReflectionResult } from "../session/sessionTypes";

export interface ReflectionWorkerApi {
  generate(input: ReflectionInput): Promise<ReflectionResult>;
}

const api: ReflectionWorkerApi = {
  async generate(input) {
    if (input.useWebLlm) {
      const webLlmResult = await tryWebLlm(input);
      if (webLlmResult) {
        return webLlmResult;
      }
    }

    return generateLocalReflection(input);
  }
};

async function tryWebLlm(input: ReflectionInput): Promise<ReflectionResult | null> {
  if (!("gpu" in navigator)) {
    return null;
  }

  try {
    const webLlm = (await import("@mlc-ai/web-llm")) as unknown as {
      CreateMLCEngine?: (model: string, options?: unknown) => Promise<{
        chat: {
          completions: {
            create: (payload: unknown) => Promise<{ choices?: Array<{ message?: { content?: string } }> }>;
          };
        };
      }>;
    };
    const createEngine = webLlm.CreateMLCEngine;
    if (!createEngine) {
      return null;
    }

    const engine = await createEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
      initProgressCallback: () => undefined
    });
    const response = await engine.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a private, non-clinical trauma journaling guide. Give short grounding guidance. Do not diagnose. Recommend emergency services if the user feels unsafe."
        },
        {
          role: "user",
          content: JSON.stringify({
            phase: input.phase,
            metrics: input.metrics,
            transcriptExcerpt: input.transcript.slice(0, 1_200)
          })
        }
      ],
      temperature: 0.2,
      max_tokens: 220
    });
    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return null;
    }

    return {
      guidance: {
        headline: "Local model reflection",
        body: content,
        prompts: [
          "Keep one detail in focus.",
          "Pause if your rating climbs.",
          "End with a grounding action."
        ],
        recommendedPhase: input.metrics.status === "overloaded" ? "pause" : input.phase
      },
      source: "web-llm"
    };
  } catch {
    return null;
  }
}

expose(api);
