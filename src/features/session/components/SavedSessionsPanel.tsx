import { Trash2 } from "lucide-react";
import type { SavedSession } from "../../storage/sessionRepository";
import { formatDuration } from "../sessionLogic";

interface SavedSessionsPanelProps {
  readonly sessions: SavedSession[];
  readonly onDelete: (id: string) => void;
  readonly onClear: () => void;
}

export function SavedSessionsPanel({ sessions, onDelete, onClear }: SavedSessionsPanelProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-quiet">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Private saves</h2>
        <button
          className="rounded-lg border border-ink/15 px-3 py-2 text-xs font-semibold text-ink disabled:opacity-40"
          disabled={sessions.length === 0}
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      </div>
      {sessions.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-ink/60">
          Nothing has been saved in this browser.
        </p>
      ) : (
        <ol className="mt-3 grid gap-2">
          {sessions.map((session) => (
            <li className="rounded-lg border border-ink/10 p-3" key={session.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {session.guidance?.headline ?? "Session note"}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    {new Date(session.createdAt).toLocaleString()} ·{" "}
                    {formatDuration(session.durationSeconds)}
                  </p>
                </div>
                <button
                  aria-label="Delete saved session"
                  className="rounded-md p-2 text-ink/50 hover:bg-ember/10 hover:text-ember"
                  onClick={() => onDelete(session.id)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
