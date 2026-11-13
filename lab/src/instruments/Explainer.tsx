import type { ReactNode } from "react";

export function Explainer({ children }: { children: ReactNode }) {
  return (
    <details open className="lab-explainer">
      <summary>
        How this experiment works
        <span className="lab-explainer-label">protocol</span>
      </summary>
      <div className="lab-explainer-body">{children}</div>
    </details>
  );
}
