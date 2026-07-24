import { useEffect, useState } from "react";
import { LogPanel } from "../../instruments/LogPanel";
import { VIDEO_SRC } from "../../videoSrc";

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
    void Promise.all([
      import("../../wc/media-player"),
      import("../../wc/lifecycle-probe"),
    ]).then(() =>
      setInfo((i) => [
        ...i,
        "WC modules imported client-side → elements upgraded",
      ]),
    );
  }, []);

  return (
    <main>
      <h2>7. SSR</h2>
      <pre style={{ background: "#f7f7f7", padding: 8 }}>{info.join("\n")}</pre>

      <h3>Custom elements rendered by the server</h3>
      <lifecycle-probe label="ssr" value="42" objectProp={{ ssr: true }} />
      <media-player src={VIDEO_SRC} video-title="SSR player" volume={0.5} />
      <p>
        <button
          onClick={() =>
            setProbeHtml(
              document.querySelector("lifecycle-probe")?.outerHTML ?? "?",
            )
          }
        >
          snapshot probe outerHTML
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
