import { Profiler, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "../../wc/reaction-card";
import { Explainer } from "../../instruments/Explainer";
import { PageHeader } from "../../instruments/PageHeader";
import { ReactionCard } from "./ReactionCard";

type Mode = "react" | "wc";
type Item = { id: number; title: string; count: number; highlighted: boolean };
type Result = {
  scenario: string;
  mode: Mode;
  n: number;
  wallMs: number;
  profilerMs: number | null;
};

const frame = () =>
  new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r())),
  );
// Which React build this page runs on. Production builds never call
// <Profiler onRender>, so its column reads "n/a" there; the profiling build
// (PROFILE=on, react-dom/profiling) keeps it.
const BUILD = import.meta.env.DEV
  ? "dev"
  : __PROFILING__
    ? "prod-profiling"
    : "prod";
const COMPILER = __COMPILER_ON__ ? "compiler on" : "compiler off";

const makeItems = (n: number): Item[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i,
    title: `item ${i}`,
    count: 0,
    highlighted: i % 2 === 0,
  }));

export default function PerfPage() {
  const [mode, setMode] = useState<Mode>("react");
  const [n, setN] = useState(100);
  const [items, setItems] = useState<Item[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);
  const profilerMs = useRef(0);
  const profilerFired = useRef(false);

  const measure = (
    scenario: string,
    currentMode: Mode,
    currentN: number,
    mutate: () => void,
  ) => {
    profilerMs.current = 0;
    profilerFired.current = false;
    const t0 = performance.now();
    flushSync(mutate);
    const wallMs = performance.now() - t0;
    flushSync(() =>
      setResults((rs) => [
        ...rs,
        {
          scenario,
          mode: currentMode,
          n: currentN,
          wallMs,
          profilerMs: profilerFired.current ? profilerMs.current : null,
        },
      ]),
    );
  };

  const runSuite = async () => {
    setRunning(true);
    setItems([]);
    await frame();
    measure("mount", mode, n, () => setItems(makeItems(n)));
    await frame();
    measure("update storm", mode, n, () =>
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          count: it.count + 1,
          highlighted: !it.highlighted,
        })),
      ),
    );
    await frame();
    // Only item 0 changes: the other N-1 elements get identical props.
    measure("update 1 of N", mode, n, () =>
      setItems((prev) =>
        prev.map((it, i) => (i === 0 ? { ...it, count: it.count + 1 } : it)),
      ),
    );
    await frame();
    // New array, same item objects: nothing to change anywhere.
    measure("re-render, nothing changed", mode, n, () =>
      setItems((prev) => [...prev]),
    );
    await frame();
    measure("unmount", mode, n, () => setItems([]));
    await frame();
    setRunning(false);
  };

  return (
    <main>
      <PageHeader
        path="/perf"
        lede="Performance side by side: N identical widgets, pure React against a web component wrapped in React."
      />
      <Explainer>
        <p>
          <strong>Tests:</strong> mount / update-storm / unmount cost of N
          identical widgets — pure React vs web component wrapped in React.
        </p>
        <ul>
          <li>
            Pick a mode and N, then "run suite" TWICE (first run includes
            warm-up) and compare rows.
          </li>
          <li>
            Wall ms = flushSync duration (render+commit, no paint); Profiler
            ms = React's actualDuration.
          </li>
          <li>
            "update 1 of N" and "re-render, nothing changed" leave most props
            unchanged, which is where the React Compiler can skip work.
          </li>
          <li>
            Running on: <strong>{BUILD}</strong>, {COMPILER}. Dev numbers
            include React's development checks; for real costs run{" "}
            <code>pnpm --filter lab build</code> then{" "}
            <code>pnpm --filter lab preview</code> (add{" "}
            <code>COMPILER=on</code> and/or <code>PROFILE=on</code> to the
            build).
          </li>
        </ul>
      </Explainer>
      <div className="lab-panel lab-toolbar">
        <label>
          mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
          >
            <option value="react">pure React</option>
            <option value="wc">web component</option>
          </select>
        </label>
        <label>
          size
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            <option value={100}>N = 100</option>
            <option value={1000}>N = 1000</option>
          </select>
        </label>
        <button className="lab-primary" onClick={runSuite} disabled={running}>
          run suite
        </button>
        <button onClick={() => setResults([])}>clear results</button>
        <span className="lab-spacer" />
        <span className="lab-fps">
          {BUILD} · {COMPILER}
        </span>
      </div>
      {/* The bench driver (scripts/perf-bench.mjs) reads this table: one
          <tr> per result in <tbody>, the five cells as plain text. */}
      {results.length > 0 ? (
        <table className="lab-table">
          <thead>
            <tr>
              <th>scenario</th>
              <th>mode</th>
              <th className="num">N</th>
              <th className="num">flushSync wall ms</th>
              <th className="num">Profiler actualDuration ms</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.scenario}</td>
                <td>
                  <span className="lab-mode" data-mode={r.mode}>
                    {r.mode}
                  </span>
                </td>
                <td className="num">{r.n}</td>
                <td className="num">{r.wallMs.toFixed(1)}</td>
                <td className="num">
                  {r.profilerMs === null ? "n/a" : r.profilerMs.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="lab-empty">
          No results yet. Pick a mode and N, then run the suite twice.
        </div>
      )}
      <Profiler
        id="bench"
        onRender={(_id, _phase, actualDuration) => {
          profilerFired.current = true;
          profilerMs.current += actualDuration;
        }}
      >
        <div className="lab-stage lab-stage-grid">
          {items.map((it) =>
            mode === "react" ? (
              <ReactionCard
                key={it.id}
                title={it.title}
                count={it.count}
                highlighted={it.highlighted}
              />
            ) : (
              <reaction-card
                key={it.id}
                title={it.title}
                count={it.count}
                highlighted={it.highlighted}
              />
            ),
          )}
        </div>
      </Profiler>
    </main>
  );
}
