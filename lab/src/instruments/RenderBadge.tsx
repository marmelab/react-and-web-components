import { useRef } from "react";

export function RenderBadge({ name }: { name: string }) {
  const count = useRef(0);
  count.current += 1;
  return (
    <span
      style={{
        background: "#eef",
        borderRadius: 3,
        padding: "1px 6px",
        fontSize: 12,
        fontFamily: "monospace",
      }}
    >
      {name} renders: {count.current}
    </span>
  );
}
