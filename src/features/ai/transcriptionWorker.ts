import { expose } from "comlink";

export interface TranscriptionRequest {
  readonly samples: Float32Array;
  readonly sampleRate: number;
}

export interface TranscriptionResponse {
  readonly text: string;
  readonly model: string;
}

export interface TranscriptionWorkerApi {
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse>;
}

let pipelinePromise: Promise<unknown> | null = null;

const api: TranscriptionWorkerApi = {
  async transcribe(request) {
    const transcriber = (await getPipeline()) as (
      audio: Float32Array,
      options: Record<string, unknown>
    ) => Promise<string | { text?: string }>;
    const response = await transcriber(request.samples, {
      sampling_rate: request.sampleRate,
      chunk_length_s: 30,
      stride_length_s: 5,
      task: "transcribe",
      language: "en"
    });

    return {
      text: typeof response === "string" ? response : response.text?.trim() ?? "",
      model: "onnx-community/whisper-tiny.en"
    };
  }
};

async function getPipeline() {
  pipelinePromise ??= import("@huggingface/transformers").then(async (module) => {
    const transformers = module as unknown as {
      env?: {
        allowLocalModels?: boolean;
        allowRemoteModels?: boolean;
      };
      pipeline: (task: string, model: string, options?: Record<string, unknown>) => Promise<unknown>;
    };

    if (transformers.env) {
      transformers.env.allowLocalModels = false;
      transformers.env.allowRemoteModels = true;
    }

    return transformers.pipeline("automatic-speech-recognition", "onnx-community/whisper-tiny.en", {
      dtype: "q8"
    });
  });

  return pipelinePromise;
}

expose(api);
