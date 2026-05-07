import { Headphones, ShieldCheck, TriangleAlert } from "lucide-react";

interface ConsentPanelProps {
  readonly headphones: boolean;
  readonly privacy: boolean;
  readonly safety: boolean;
  readonly onChange: (key: "headphones" | "privacy" | "safety", value: boolean) => void;
}

export function ConsentPanel({ headphones, privacy, safety, onChange }: ConsentPanelProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 shadow-quiet">
      <div className="flex items-center gap-2">
        <ShieldCheck aria-hidden="true" className="text-moss" size={20} />
        <h2 className="text-lg font-semibold">Session readiness</h2>
      </div>
      <div className="mt-4 grid gap-3">
        <label className="flex gap-3 rounded-lg border border-ink/10 p-3">
          <input
            checked={headphones}
            className="mt-1 h-4 w-4 accent-tide"
            data-testid="headphones-check"
            onChange={(event) => onChange("headphones", event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="flex items-center gap-2 font-medium">
              <Headphones aria-hidden="true" size={16} />
              Headphones are on
            </span>
            <span className="mt-1 block text-sm leading-6 text-ink/65">
              Bilateral tones only make sense when left and right channels are separated.
            </span>
          </span>
        </label>
        <label className="flex gap-3 rounded-lg border border-ink/10 p-3">
          <input
            checked={privacy}
            className="mt-1 h-4 w-4 accent-tide"
            data-testid="privacy-check"
            onChange={(event) => onChange("privacy", event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="font-medium">I want this session to stay local</span>
            <span className="mt-1 block text-sm leading-6 text-ink/65">
              The app stores notes only if you choose to save them in this browser.
            </span>
          </span>
        </label>
        <label className="flex gap-3 rounded-lg border border-ink/10 p-3">
          <input
            checked={safety}
            className="mt-1 h-4 w-4 accent-ember"
            data-testid="safety-check"
            onChange={(event) => onChange("safety", event.target.checked)}
            type="checkbox"
          />
          <span>
            <span className="flex items-center gap-2 font-medium">
              <TriangleAlert aria-hidden="true" size={16} />
              This is not emergency care
            </span>
            <span className="mt-1 block text-sm leading-6 text-ink/65">
              If you are in immediate danger, contact local emergency services.
            </span>
          </span>
        </label>
      </div>
    </section>
  );
}
