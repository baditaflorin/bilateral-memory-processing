export interface RecordingResult {
  readonly blob: Blob;
  readonly durationSeconds: number;
  readonly mimeType: string;
}

export class RecordingController {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: BlobPart[] = [];
  private startedAt = 0;

  get isRecording() {
    return this.mediaRecorder?.state === "recording";
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone recording is not supported in this browser.");
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    });
    const mimeType = chooseMimeType();
    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    });
    this.startedAt = performance.now();
    this.mediaRecorder.start(1_000);
  }

  async stop(): Promise<RecordingResult> {
    if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
      throw new Error("No active recording was found.");
    }

    const recorder = this.mediaRecorder;
    const stopped = new Promise<void>((resolve) => {
      recorder.addEventListener("stop", () => resolve(), { once: true });
    });

    recorder.stop();
    await stopped;
    this.stream?.getTracks().forEach((track) => track.stop());

    const durationSeconds = (performance.now() - this.startedAt) / 1_000;
    const blob = new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" });
    const result = {
      blob,
      durationSeconds,
      mimeType: recorder.mimeType || "audio/webm"
    };
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    return result;
  }
}

function chooseMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}
