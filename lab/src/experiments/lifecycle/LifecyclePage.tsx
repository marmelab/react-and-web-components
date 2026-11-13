import { StrictMode, useEffect, useRef, useState } from "react";
import "../../wc/lifecycle-probe";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
import { RenderBadge } from "../../instruments/RenderBadge";
import { Explainer } from "../../instruments/Explainer";
import { PageHeader } from "../../instruments/PageHeader";

export default function LifecyclePage() {
  const [mounted, setMounted] = useState(true);
  const [label, setLabel] = useState("A");
  const [value, setValue] = useState(1);
  const [objTick, setObjTick] = useState(0);
  const [keyN, setKeyN] = useState(0);
  const [tick, setTick] = useState(0); // re-render with SAME props
  const [container, setContainer] = useState<"left" | "right">("left");
  const [order, setOrder] = useState<"probe-first" | "probe-last">(
    "probe-first",
  );
  const [strict, setStrict] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const listener = (e: Event) =>
      logEvent(
        "page",
        `ref.addEventListener caught probe-event detail=${JSON.stringify((e as CustomEvent).detail)}`,
      );
    el.addEventListener("probe-event", listener);
    return () => el.removeEventListener("probe-event", listener);
  }, [mounted, keyN, container, strict]);

  const probe = mounted ? (
    <lifecycle-probe
      key={keyN}
      ref={ref}
      label={label}
      value={String(value)}
      objectProp={{ tick: objTick }}
      onProbeEvent={() => logEvent("page", "JSX onProbeEvent fired")}
      onprobe-event={() => logEvent("page", "JSX 'onprobe-event' fired")}
    />
  ) : null;

  const tree = (
    <div className="lab-split">
      <fieldset>
        <legend>
          left{" "}
          {order === "probe-first"
            ? "(probe, then sibling)"
            : "(sibling, then probe)"}
        </legend>
        {container === "left" &&
          (order === "probe-first"
            ? [
                <div key="p">{probe}</div>,
                <p key="s" className="lab-sibling">
                  sibling
                </p>,
              ]
            : [
                <p key="s" className="lab-sibling">
                  sibling
                </p>,
                <div key="p">{probe}</div>,
              ])}
      </fieldset>
      <fieldset>
        <legend>right</legend>
        {container === "right" && probe}
      </fieldset>
    </div>
  );

  return (
    <main>
      <PageHeader
        path="/lifecycle"
        lede="Callbacks and channels: what React 19 does to a custom element it drives."
      >
        <RenderBadge name="page" />
      </PageHeader>
      <Explainer>
        <p>
          <strong>Tests:</strong> when custom-element callbacks fire while
          React drives the element, and which channel React 19 uses (property
          vs attribute vs event).
        </p>
        <ul>
          <li>Press each button once and read the event log after each.</li>
          <li>
            "re-render, same props" logs no attribute changes — but{" "}
            <code>objectProp</code> STILL re-fires a PROPERTY line every time:
            it's a fresh object literal each render and React compares
            non-primitives by reference only.
          </li>
          <li>
            "change objectProp" logs a PROPERTY line (accessor exists →
            property path); label/value log attributeChangedCallback
            (attribute path).
          </li>
          <li>
            "reorder within parent" moves the DOM node (disconnected+connected,
            same instance); "move to other container" and "remount via key"
            destroy it (new constructor).
          </li>
          <li>
            Click the probe itself: only the ref+addEventListener and the
            literal <code>"onprobe-event"</code> prop fire — camelCase{" "}
            <code>onProbeEvent</code> listens for a "ProbeEvent" event, which
            never comes.
          </li>
        </ul>
      </Explainer>
      <div className="lab-panel">
        <div className="lab-toolbar">
          <span className="lab-toolbar-label">Props</span>
          <button onClick={() => setTick(tick + 1)}>
            re-render parent, same props{" "}
            <span className="lab-count">{tick}</span>
          </button>
          <button onClick={() => setLabel(label === "A" ? "B" : "A")}>
            change label attribute <span className="lab-count">{label}</span>
          </button>
          <button onClick={() => setValue(value + 1)}>
            change value attribute <span className="lab-count">{value}</span>
          </button>
          <button onClick={() => setObjTick(objTick + 1)}>
            change objectProp (object){" "}
            <span className="lab-count">{objTick}</span>
          </button>
        </div>
        <div className="lab-toolbar">
          <span className="lab-toolbar-label">Tree</span>
          <button onClick={() => setKeyN(keyN + 1)}>
            remount via key <span className="lab-count">{keyN}</span>
          </button>
          <button onClick={() => setMounted(!mounted)}>
            {mounted ? "unmount" : "mount"}
          </button>
          <button
            onClick={() =>
              setOrder(order === "probe-first" ? "probe-last" : "probe-first")
            }
          >
            reorder within parent (keyed)
          </button>
          <button
            onClick={() =>
              setContainer(container === "left" ? "right" : "left")
            }
          >
            move to other container
          </button>
          <label>
            <input
              type="checkbox"
              checked={strict}
              onChange={(e) => setStrict(e.target.checked)}
            />
            StrictMode subtree
          </label>
        </div>
      </div>
      {strict ? <StrictMode>{tree}</StrictMode> : tree}
      <LogPanel />
    </main>
  );
}
