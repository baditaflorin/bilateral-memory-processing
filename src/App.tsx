import { SessionApp } from "./features/session/SessionApp";
import { ToastProvider } from "./shared/toast";

export function App() {
  return (
    <ToastProvider>
      <SessionApp />
    </ToastProvider>
  );
}
