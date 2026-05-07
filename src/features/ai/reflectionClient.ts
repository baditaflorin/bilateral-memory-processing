import { wrap } from "comlink";
import type { ReflectionWorkerApi } from "./reflectionWorker";
import type { ReflectionInput } from "../session/sessionTypes";

let worker: Worker | null = null;
let api: ReflectionWorkerApi | null = null;

export async function generateReflection(input: ReflectionInput) {
  if (!worker || !api) {
    worker = new Worker(new URL("./reflectionWorker.ts", import.meta.url), { type: "module" });
    api = wrap<ReflectionWorkerApi>(worker);
  }

  return api.generate(input);
}
