import { useState } from "react";
import { RenderBadge } from "../../instruments/RenderBadge";

function CompilerCheck() {
  const [clicks, setClicks] = useState(0);
  return (
    <fieldset>
      <legend>compiler check</legend>
      <button onClick={() => setClicks(clicks + 1)}>
        re-render parent ({clicks})
      </button>{" "}
      <RenderBadge name="child-with-constant-props" />
      <p style={{ fontSize: 12 }}>
        Compiler ON ⇒ the badge should stay at 1 while clicks increase.
      </p>
    </fieldset>
  );
}

export function HomePage() {
  return (
    <main>
      <h2>Experiments</h2>
      <p>
        Each experiment is a route (top nav). Results are shown live in on-page
        instrument panels and recorded in <code>FINDINGS.md</code>. Run each
        experiment in Chrome AND Firefox.
      </p>
      <p>
        React Compiler: wired in Task 10 — start with{" "}
        <code>COMPILER=on pnpm dev</code> to enable it.
      </p>
      <CompilerCheck />
    </main>
  );
}
