import { useEffect, useState, type ReactNode } from "react";
import { FpsMeter } from "../../instruments/FpsMeter";
import { RenderBadge } from "../../instruments/RenderBadge";

export type StressState = {
  tick: number;
  title: string;
  volume: number;
  side: "left" | "right";
  keyN: number;
};

export function StressHarness({
  render,
}: {
  render: (s: StressState) => ReactNode;
}) {
  const [hz, setHz] = useState(0);
  const [tick, setTick] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  const [title, setTitle] = useState("stress test");
  const [volume, setVolume] = useState(1);
  const [side, setSide] = useState<"left" | "right">("left");
  const [keyN, setKeyN] = useState(0);

  useEffect(() => {
    if (hz === 0) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000 / hz);
    return () => clearInterval(id);
  }, [hz]);

  const s: StressState = { tick, title, volume, side, keyN };
  const content = <div key={keyN}>{render(s)}</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <label>
          re-render:{" "}
          <input
            type="range"
            min={0}
            max={20}
            value={hz}
            onChange={(e) => setHz(Number(e.target.value))}
          />{" "}
          {hz}/s (tick {tick})
        </label>
        <button onClick={() => setUnrelated(unrelated + 1)}>
          unrelated state ({unrelated})
        </button>
        <label>
          title prop:{" "}
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          volume prop:{" "}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
        <button onClick={() => setSide(side === "left" ? "right" : "left")}>
          reparent (in {side})
        </button>
        <button onClick={() => setKeyN(keyN + 1)}>
          remount via key ({keyN})
        </button>
        <RenderBadge name="harness" /> <FpsMeter />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <fieldset style={{ flex: 1, minHeight: 40 }}>
          <legend>left</legend>
          {side === "left" && content}
        </fieldset>
        <fieldset style={{ flex: 1, minHeight: 40 }}>
          <legend>right</legend>
          {side === "right" && content}
        </fieldset>
      </div>
    </div>
  );
}
