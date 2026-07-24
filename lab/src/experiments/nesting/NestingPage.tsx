import { useEffect, useRef, useState } from "react";
import "../../wc/inner-app";
import { OuterContext } from "../../wc/inner-app";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";

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

  const rapidRemount = () => {
    let flips = 0;
    const id = setInterval(() => {
      setMounted((m) => !m);
      if (++flips >= 20) clearInterval(id);
    }, 50);
  };

  return (
    <main>
      <h2>3. Nesting: React → WC → React</h2>
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
