import { Profiler, useRef, useState } from "react";
import { flushSync } from "react-dom";
import "../../wc/reaction-card";
import { ReactionCard } from "./ReactionCard";

type Mode = "react" | "wc";
type Item = { id: number; title: string; count: number; highlighted: boolean };
type Result = {
  scenario: string;
  mode: Mode;
  n: number;
  wallMs: number;
  profilerMs: number;
};

const frame = () =>
  new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r())),
  );
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

  const measure = (
    scenario: string,
    currentMode: Mode,
    currentN: number,
    mutate: () => void,
  ) => {
    profilerMs.current = 0;
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
          profilerMs: profilerMs.current,
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
    measure("unmount", mode, n, () => setItems([]));
    await frame();
    setRunning(false);
  };

  return (
    <main>
      <h2>4. Performance side by side</h2>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
          <option value="react">pure React</option>
          <option value="wc">web component</option>
        </select>
        <select value={n} onChange={(e) => setN(Number(e.target.value))}>
          <option value={100}>N = 100</option>
          <option value={1000}>N = 1000</option>
        </select>
        <button onClick={runSuite} disabled={running}>
          run suite
        </button>
        <button onClick={() => setResults([])}>clear results</button>
      </div>
      <table
        border={1}
        cellPadding={4}
        style={{
          borderCollapse: "collapse",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        <thead>
          <tr>
            <th>scenario</th>
            <th>mode</th>
            <th>N</th>
            <th>flushSync wall ms</th>
            <th>Profiler actualDuration ms</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i}>
              <td>{r.scenario}</td>
              <td>{r.mode}</td>
              <td>{r.n}</td>
              <td>{r.wallMs.toFixed(1)}</td>
              <td>{r.profilerMs.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Profiler
        id="bench"
        onRender={(_id, _phase, actualDuration) => {
          profilerMs.current += actualDuration;
        }}
      >
        <div
          style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 4 }}
        >
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
