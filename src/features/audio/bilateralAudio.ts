import type { ToneSettings } from "../session/sessionTypes";

export class BilateralAudioEngine {
  private context: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private panner: StereoPannerNode | null = null;
  private timer: number | null = null;
  private side: -1 | 1 = -1;
  private settings: ToneSettings;

  constructor(settings: ToneSettings) {
    this.settings = settings;
  }

  get isRunning() {
    return this.timer !== null;
  }

  async start(settings = this.settings) {
    this.settings = settings;
    if (!this.context) {
      this.context = new AudioContext();
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.stopNodes();

    this.oscillator = new OscillatorNode(this.context, {
      frequency: this.settings.frequency,
      type: this.settings.wave
    });
    this.gain = new GainNode(this.context, { gain: this.settings.volume });
    this.panner = new StereoPannerNode(this.context, { pan: this.side });

    this.oscillator.connect(this.gain).connect(this.panner).connect(this.context.destination);
    this.oscillator.start();
    this.timer = window.setInterval(() => this.flip(), this.settings.intervalMs);
  }

  update(settings: ToneSettings) {
    this.settings = settings;
    if (!this.context) {
      return;
    }

    if (this.oscillator) {
      this.oscillator.frequency.setTargetAtTime(settings.frequency, this.context.currentTime, 0.02);
      this.oscillator.type = settings.wave;
    }
    if (this.gain) {
      this.gain.gain.setTargetAtTime(settings.volume, this.context.currentTime, 0.03);
    }
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = window.setInterval(() => this.flip(), settings.intervalMs);
    }
  }

  stop() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.stopNodes();
  }

  async dispose() {
    this.stop();
    await this.context?.close();
    this.context = null;
  }

  private flip() {
    if (!this.context || !this.panner) {
      return;
    }
    this.side = this.side === -1 ? 1 : -1;
    this.panner.pan.cancelScheduledValues(this.context.currentTime);
    this.panner.pan.setTargetAtTime(this.side, this.context.currentTime, 0.045);
  }

  private stopNodes() {
    try {
      this.oscillator?.stop();
    } catch {
      // The oscillator may already be stopped.
    }
    this.oscillator?.disconnect();
    this.gain?.disconnect();
    this.panner?.disconnect();
    this.oscillator = null;
    this.gain = null;
    this.panner = null;
  }
}
