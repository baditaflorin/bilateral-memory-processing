interface BilateralVisualizerProps {
  readonly active: boolean;
  readonly intervalMs: number;
}

export function BilateralVisualizer({ active, intervalMs }: BilateralVisualizerProps) {
  return (
    <div
      aria-label={active ? "Bilateral tone is active" : "Bilateral tone is stopped"}
      className="relative h-32 overflow-hidden rounded-lg border border-ink/10 bg-white"
      data-testid="bilateral-visualizer"
    >
      <div className="absolute inset-x-8 top-1/2 h-px bg-ink/10" />
      <div className="absolute left-10 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-tide/90 shadow-quiet" />
      <div className="absolute right-10 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-ember/90 shadow-quiet" />
      <div
        className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-ink transition-opacity"
        style={{
          animation: active ? `bilateral-sweep ${intervalMs * 2}ms ease-in-out infinite` : "none",
          left: active ? "calc(50% - 16px)" : "calc(10% + 40px)",
          opacity: active ? 0.9 : 0.35
        }}
      />
    </div>
  );
}
