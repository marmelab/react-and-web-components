import { useEffect, useRef, useState } from "react";
import "../../wc/inner-app";
import { OuterContext } from "../../wc/inner-app";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
import { Explainer } from "../../instruments/Explainer";

export default function NestingPage() {
  const [mounted, setMounted] = useState(true);
  const [greeting, setGreeting] = useState("hello from outer React");
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const composed = (e: Event) =>
      logEvent(
        "page",
        `caught inner-event (composed) detail=${JSON.stringify((e as CustomEvent).detail)}`,
      );
    const scoped = (e: Event) =>
      logEvent("page", `caught inner-event-scoped — should NOT happen`);
    el.addEventListener("inner-event", composed);
    el.addEventListener("inner-event-scoped", scoped);
    return () => {
      el.removeEventListener("inner-event", composed);
      el.removeEventListener("inner-event-scoped", scoped);
    };
  }, [mounted]);

  const rapidId = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (rapidId.current) clearInterval(rapidId.current);
    };
  }, []);

  const rapidRemount = () => {
    if (rapidId.current) clearInterval(rapidId.current);
    let flips = 0;
    rapidId.current = setInterval(() => {
      setMounted((m) => !m);
      // `flips += 1`, not `++flips`: the native React Compiler can't compile
      // an update expression yet and would skip the whole component.
      flips += 1;
      if (flips >= 20) {
        if (rapidId.current) clearInterval(rapidId.current);
        rapidId.current = null;
      }
    }, 50);
  };

  return (
    <main>
      <h2>3. Nesting: React → WC → React</h2>
      <Explainer>
        <p>
          <strong>Tests:</strong> a web component that boots its own React
          root inside its shadow DOM, used from an outer React app.
        </p>
        <ul>
          <li>
            The outer Provider sets a context value — the inner app still
            shows "outer-default": context never crosses root boundaries.
          </li>
          <li>
            Typing in the input re-renders the inner app through the
            attribute bridge.
          </li>
          <li>
            "emit composed event" reaches the page log; the non-composed one
            stops at the shadow boundary.
          </li>
          <li>
            "rapid remount ×20" exercises teardown: the element uses the
            isConnected-check deferred unmount (see FINDINGS §3 for the race
            it prevents).
          </li>
        </ul>
      </Explainer>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setMounted(!mounted)}>
          {mounted ? "unmount" : "mount"}
        </button>
        <button onClick={rapidRemount}>rapid remount ×20</button>
        <input
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          style={{ width: 260 }}
        />
      </div>
      <OuterContext.Provider value="OUTER PROVIDER VALUE">
        {mounted && <inner-app ref={ref} greeting={greeting} />}
      </OuterContext.Provider>
      <p>
        If the inner app shows "outer-default", context did NOT cross the root
        boundary (expected).
      </p>
      <LogPanel />
    </main>
  );
}
