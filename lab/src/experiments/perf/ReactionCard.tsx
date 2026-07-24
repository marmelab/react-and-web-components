export function ReactionCard({
  title,
  count,
  highlighted,
}: {
  title: string;
  count: number;
  highlighted: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "2px 6px",
        font: "12px system-ui",
        background: highlighted ? "#ffe9a8" : undefined,
      }}
    >
      {title} <b>{count}</b>
    </span>
  );
}
