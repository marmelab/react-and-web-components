import { useRef } from "react";

export function RenderBadge({ name }: { name: string }) {
  const count = useRef(0);
  // DELIBERATE: mutate ref in render to count parent renders. Since this component is unmemoized,
  // its render count equals the parent's. With React Compiler ON, the compiler may
  // memoize the element so count freezes when `name` is unchanged — that is itself a finding.
  count.current += 1;
  return (
    <span className="lab-badge">
      {name} renders: <b>{count.current}</b>
    </span>
  );
}
