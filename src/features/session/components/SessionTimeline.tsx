import type { SessionEvent } from "../sessionTypes";

interface SessionTimelineProps {
  readonly events: SessionEvent[];
}

export function SessionTimeline({ events }: SessionTimelineProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-quiet">
      <h2 className="text-lg font-semibold">Timeline</h2>
      {events.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-ink/60">Session events will appear here.</p>
      ) : (
        <ol className="mt-3 grid gap-2">
          {events.slice(-8).map((event) => (
            <li className="rounded-lg border border-ink/10 p-3" key={event.id}>
              <p className="text-sm font-medium">{event.label}</p>
              <p className="mt-1 text-xs text-ink/55">{new Date(event.at).toLocaleTimeString()}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
