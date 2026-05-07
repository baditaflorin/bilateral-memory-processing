export interface SpeakOptions {
  readonly allowSystemFallback: boolean;
}

export async function speakGuidance(text: string, options: SpeakOptions) {
  const piperResult = await tryPiper(text);
  if (piperResult) {
    return piperResult;
  }

  if (options.allowSystemFallback && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 0.95;
    window.speechSynthesis.speak(utterance);
    return "system-speech";
  }

  throw new Error("Piper voice assets could not be initialized in this browser.");
}

async function tryPiper(text: string) {
  try {
    const piper = (await import("piper-tts-web")) as unknown as {
      PiperWebEngine?: new () => {
        generate: (
          text: string,
          voice: string,
          speaker: number
        ) => Promise<{ audio?: Blob | ArrayBuffer | Uint8Array }>;
      };
    };
    if (!piper.PiperWebEngine) {
      return null;
    }

    const engine = new piper.PiperWebEngine();
    const response = await engine.generate(text, "en_US-libritts_r-medium", 0);
    const audio = normalizeAudio(response.audio);
    if (!audio) {
      return null;
    }

    const url = URL.createObjectURL(audio);
    const element = new Audio(url);
    await element.play();
    element.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
    return "piper";
  } catch {
    return null;
  }
}

function normalizeAudio(audio: Blob | ArrayBuffer | Uint8Array | undefined) {
  if (!audio) {
    return null;
  }
  if (audio instanceof Blob) {
    return audio;
  }
  if (audio instanceof Uint8Array) {
    const copy = new Uint8Array(audio);
    return new Blob([copy.buffer], { type: "audio/wav" });
  }
  return new Blob([audio], { type: "audio/wav" });
}
