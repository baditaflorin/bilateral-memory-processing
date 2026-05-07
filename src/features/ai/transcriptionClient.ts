import { wrap } from "comlink";
import type { TranscriptionRequest, TranscriptionWorkerApi } from "./transcriptionWorker";

let worker: Worker | null = null;
let api: TranscriptionWorkerApi | null = null;

export async function transcribeWithWhisper(request: TranscriptionRequest) {
  if (!worker || !api) {
    worker = new Worker(new URL("./transcriptionWorker.ts", import.meta.url), { type: "module" });
    api = wrap<TranscriptionWorkerApi>(worker);
  }

  return api.transcribe(request);
}
