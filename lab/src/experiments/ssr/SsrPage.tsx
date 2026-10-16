import { useEffect, useState } from "react";
import { LogPanel } from "../../instruments/LogPanel";
import { Explainer } from "../../instruments/Explainer";
import { VIDEO_SRC } from "../../videoSrc";

// Client-only: these modules extend HTMLElement, which Node doesn't have.
// Kept outside the component because the native React Compiler can't compile
// a component containing a dynamic import() yet and would skip it.
const loadElementModules = () =>
  Promise.all([
    import("../../wc/media-player"),
    import("../../wc/lifecycle-probe"),
  ]);

export default function SsrPage() {
  const [info, setInfo] = useState<string[]>([]);
  const [probeHtml, setProbeHtml] = useState("");

  useEffect(() => {
    // Client-only data, set after mount to avoid hydration mismatches.
    setInfo([
      `was server-rendered: ${String(window.__WAS_SSR__)}`,
      ...(window.__SSR_LOG__ ?? ["(no server log — SPA mode)"]),
    ]);
    // Upgrade timing: elements below exist as unregistered <media-player> /
    // <lifecycle-probe> tags until these dynamic imports register them.
    void loadElementModules().then(() =>
      setInfo((i) => [
        ...i,
        "WC modules imported client-side → elements upgraded",
      ]),
    );
  }, []);

  return (
    <main>
      <h2>7. SSR</h2>
      <Explainer>
        <p>
          <strong>Tests:</strong> what React 19's server renderer does with
          custom elements. Serve this page two ways and compare:{" "}
          <code>pnpm dev:ssr</code> → port 5199 (server-rendered + hydrated)
          vs <code>pnpm dev</code> → port 5173 (pure SPA).
        </p>
        <ul>
          <li>
            The grey block shows whether THIS load was server-rendered and
            what the server logged.
          </li>
          <li>
            The custom elements below arrive as inert tags and upgrade only
            after hydration, when their modules load client-side — watch the
            event log for post-hydration constructors.
          </li>
          <li>
            On 5199, <code>volume=0.5</code> got stuck as a dead attribute
            (element upgraded after React's assignment) — use the snapshot
            button below and look at the media-player tag's attributes.
          </li>
          <li>
            The Declarative Shadow DOM block: the stream creates a real shadow
            root, and since React 19.3 it survives hydration and later
            re-renders. React 19.2 rewrote the <code>innerHTML</code> of an
            inline <code>{"{{ __html }}"}</code> object on every re-render,
            which destroyed it (FINDINGS §7).
          </li>
        </ul>
      </Explainer>
      <pre style={{ background: "#f7f7f7", padding: 8 }}>{info.join("\n")}</pre>

      <h3>Custom elements rendered by the server</h3>
      <lifecycle-probe label="ssr" value="42" objectProp={{ ssr: true }} />
      <media-player src={VIDEO_SRC} video-title="SSR player" volume={0.5} />
      <p>
        <button
          onClick={() =>
            setProbeHtml(
              [
                document.querySelector("lifecycle-probe")?.outerHTML ?? "?",
                document.querySelector("media-player")?.outerHTML ?? "?",
              ].join("\n\n"),
            )
          }
        >
          snapshot custom elements outerHTML
        </button>
      </p>
      {probeHtml && (
        <pre style={{ background: "#f7f7f7", padding: 8 }}>{probeHtml}</pre>
      )}

      <h3>Declarative Shadow DOM</h3>
      <div
        dangerouslySetInnerHTML={{
          __html: `<div><template shadowrootmode="open"><style>p{color:tomato;font-weight:bold}</style><p>DSD content — tomato+bold ⇒ shadow root was created</p></template><p>light-DOM fallback (visible ⇒ NO shadow root)</p></div>`,
        }}
      />
      <LogPanel />
    </main>
  );
}
