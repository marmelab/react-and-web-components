// Twin of <reaction-card> (src/wc/reaction-card.ts): same look, same number
// of style declarations, so neither side of the benchmark pays for more CSS.
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
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: "2px 7px",
        font: "12px var(--lab-font-sans)",
        background: highlighted ? "#fef3c7" : undefined,
      }}
    >
      {title} <b>{count}</b>
    </span>
  );
}
