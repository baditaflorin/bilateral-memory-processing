import { CircleStop, Play, Volume2, Waves } from "lucide-react";
import type { ToneSettings } from "../sessionTypes";
import { BilateralVisualizer } from "./BilateralVisualizer";

interface ToneControlsProps {
  readonly canStart: boolean;
  readonly isPlaying: boolean;
  readonly settings: ToneSettings;
  readonly onChange: (settings: ToneSettings) => void;
  readonly onStart: () => void;
  readonly onStop: () => void;
}

export function ToneControls({
  canStart,
  isPlaying,
  settings,
  onChange,
  onStart,
  onStop
}: ToneControlsProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-quiet">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Waves aria-hidden="true" className="text-tide" size={20} />
          <h2 className="text-lg font-semibold">Bilateral tones</h2>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/30"
            data-testid="start-tone"
            disabled={!canStart || isPlaying}
            onClick={onStart}
            type="button"
          >
            <Play aria-hidden="true" size={16} />
            Start
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="stop-tone"
            disabled={!isPlaying}
            onClick={onStop}
            type="button"
          >
            <CircleStop aria-hidden="true" size={16} />
            Stop
          </button>
        </div>
      </div>

      <div className="mt-4">
        <BilateralVisualizer active={isPlaying} intervalMs={settings.intervalMs} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium">
          Frequency {settings.frequency} Hz
          <input
            aria-label="Tone frequency"
            className="accent-tide"
            max={880}
            min={120}
            onChange={(event) => onChange({ ...settings, frequency: Number(event.target.value) })}
            step={10}
            type="range"
            value={settings.frequency}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Pace {Math.round(60_000 / (settings.intervalMs * 2))} cycles/min
          <input
            aria-label="Tone pace"
            className="accent-ember"
            max={1200}
            min={300}
            onChange={(event) => onChange({ ...settings, intervalMs: Number(event.target.value) })}
            step={50}
            type="range"
            value={settings.intervalMs}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span className="flex items-center gap-2">
            <Volume2 aria-hidden="true" size={16} />
            Volume {Math.round(settings.volume * 100)}%
          </span>
          <input
            aria-label="Tone volume"
            className="accent-moss"
            max={0.16}
            min={0.01}
            onChange={(event) => onChange({ ...settings, volume: Number(event.target.value) })}
            step={0.01}
            type="range"
            value={settings.volume}
          />
        </label>
      </div>
    </section>
  );
}
