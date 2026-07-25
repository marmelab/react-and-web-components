import type { ReactNode } from "react";

export function Explainer({ children }: { children: ReactNode }) {
  return (
    <details open style={{ background: "#f6f8fa", border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", margin: "8px 0" }}>
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>How this experiment works</summary>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{children}</div>
    </details>
  );
}
