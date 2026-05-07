import type { PropsWithChildren } from "react";
import { Component } from "react";

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-paper px-6 py-10 text-ink">
          <section className="mx-auto max-w-2xl rounded-lg border border-ember/30 bg-white p-6 shadow-quiet">
            <p className="text-sm font-semibold uppercase tracking-wide text-ember">Session paused</p>
            <h1 className="mt-3 text-3xl font-semibold">Something local failed to load.</h1>
            <p className="mt-4 leading-7 text-ink/75">
              Your recording and notes were not uploaded by this app. Refresh the page to restart the
              local interface.
            </p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
