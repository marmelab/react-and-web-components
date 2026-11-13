import { useState } from "react";
import { experiments } from "../../experiments";
import { Link } from "../../router";
import { RenderBadge } from "../../instruments/RenderBadge";

function CompilerCheck() {
  const [clicks, setClicks] = useState(0);
  return (
    <fieldset>
      <legend>compiler check</legend>
      <div className="lab-toolbar">
        <button onClick={() => setClicks(clicks + 1)}>
          re-render parent <span className="lab-count">{clicks}</span>
        </button>
        <RenderBadge name="child-with-constant-props" />
      </div>
      <p className="lab-hint">
        Compiler ON ⇒ the badge should stay at 1 while clicks increase.
      </p>
    </fieldset>
  );
}

export function HomePage() {
  return (
    <main>
      <div className="lab-eyebrow">Investigation lab</div>
      <div className="lab-title">
        <h1>How does React 19 handle web components?</h1>
      </div>
      <p className="lab-lede">
        Each experiment is a route. Results show live in on-page instruments:
        render badges, an fps meter and an event log that names the channel
        React used. Run each experiment in Chrome and Firefox.
      </p>
      <div className="lab-cards">
        {experiments.map((e) => (
          <Link key={e.path} to={e.path} className="lab-card">
            <span className="lab-card-n">EXPERIMENT {e.n}</span>
            <span className="lab-card-title">{e.title}</span>
            <span className="lab-card-summary">{e.summary}</span>
          </Link>
        ))}
      </div>
      <h3>React Compiler</h3>
      <p className="lab-hint">
        Start with <code>COMPILER=on pnpm dev</code> to enable it (the native
        compiler from <code>oxc-transform-react</code>). The header says which
        one is running.
      </p>
      <CompilerCheck />
    </main>
  );
}
