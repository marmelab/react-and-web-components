import { useEffect, useRef, useState, type ReactNode } from "react";
import { FpsMeter } from "../../instruments/FpsMeter";
import { logEvent } from "../../instruments/log";
import { RenderBadge } from "../../instruments/RenderBadge";

export type StressState = {
  tick: number;
  title: string;
  volume: number;
  side: "left" | "right";
  keyN: number;
};

type Side = "left" | "right";

export function StressHarness({
  render,
  domMoveSelector,
}: {
  render: (s: StressState) => ReactNode;
  // When set, adds a button that moves the matching element to the other
  // container with plain DOM calls, without React knowing.
  domMoveSelector?: string;
}) {
  const [hz, setHz] = useState(0);
  const [tick, setTick] = useState(0);
  const [unrelated, setUnrelated] = useState(0);
  const [title, setTitle] = useState("stress test");
  const [volume, setVolume] = useState(1);
  const [side, setSide] = useState<Side>("left");
  const [keyN, setKeyN] = useState(0);
  const [domSide, setDomSide] = useState<Side | null>(null);
  const containersRef = useRef<HTMLDivElement>(null);
  // Two plain refs, not an object of refs: the React Compiler reads
  // `docks.left` in JSX as a ref access during render and skips the component.
  const leftDock = useRef<HTMLDivElement>(null);
  const rightDock = useRef<HTMLDivElement>(null);
  // Where the DOM-moved element sat in React's tree. It must go back there
  // before React reparents or remounts: React removes its old subtree from
  // where it rendered it, which would leave the moved element behind, still
  // playing next to the new one.
  const home = useRef<{ el: Element; parent: Node; next: Node | null } | null>(
    null,
  );

  const moveHome = (why: string) => {
    const h = home.current;
    if (!h) return;
    logEvent(
      "harness",
      `DOM move: ${domMoveSelector} back to ${side} (${why})`,
    );
    h.parent.insertBefore(h.el, h.next);
    home.current = null;
    setDomSide(null);
  };

  const domMove = () => {
    if (home.current) return moveHome("React not involved");
    const el = domMoveSelector
      ? containersRef.current?.querySelector(domMoveSelector)
      : null;
    const other: Side = side === "left" ? "right" : "left";
    const dock = (other === "left" ? leftDock : rightDock).current;
    if (!el?.parentNode || !dock) return;
    home.current = { el, parent: el.parentNode, next: el.nextSibling };
    logEvent(
      "harness",
      `DOM move: ${domMoveSelector} to ${other} via appendChild (React not involved)`,
    );
    // Same element, same <video>: a media element removed and re-inserted in
    // the same task is never paused, so playback carries on.
    dock.appendChild(el);
    setDomSide(other);
  };

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
        <button
          onClick={() => {
            moveHome("undone before React reparent");
            setSide(side === "left" ? "right" : "left");
          }}
        >
          reparent (in {side})
        </button>
        {domMoveSelector && (
          <button onClick={domMove}>
            move WC via DOM (in {domSide ?? side})
          </button>
        )}
        <button
          onClick={() => {
            moveHome("undone before React remount");
            setKeyN(keyN + 1);
          }}
        >
          remount via key ({keyN})
        </button>
        <RenderBadge name="harness" /> <FpsMeter />
      </div>
      <div ref={containersRef} style={{ display: "flex", gap: 16 }}>
        <fieldset style={{ flex: 1, minHeight: 40 }}>
          <legend>left</legend>
          {side === "left" && content}
          {/* React renders no children here, so it never touches what the
              DOM move puts inside. */}
          <div ref={leftDock} />
        </fieldset>
        <fieldset style={{ flex: 1, minHeight: 40 }}>
          <legend>right</legend>
          {side === "right" && content}
          <div ref={rightDock} />
        </fieldset>
      </div>
    </div>
  );
}
