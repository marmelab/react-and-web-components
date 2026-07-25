import { useEffect, useRef } from "react";
import "../../wc/media-player";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
import { Explainer } from "../../instruments/Explainer";
import { ReactPlayer } from "../../react-player/ReactPlayer";
import { VIDEO_SRC } from "../../videoSrc";
import { StressHarness } from "./StressHarness";

// Task 3 finding (FINDINGS.md section 1): camelCase JSX event props like
// `onPlayStateChange` are silently inert on custom elements — verified again
// here (section 2): no `[page]` log line ever appeared despite real play/pause
// transitions. Falling back to the documented pattern: ref + addEventListener.
function WcMediaPlayer({
  src,
  videoTitle,
  volume,
}: {
  src: string;
  videoTitle: string;
  volume: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onPlayStateChange = (e: Event) =>
      logEvent(
        "page",
        `play-state-change: ${JSON.stringify((e as CustomEvent).detail)}`,
      );
    el.addEventListener("play-state-change", onPlayStateChange);
    return () =>
      el.removeEventListener("play-state-change", onPlayStateChange);
  }, []);

  return (
    <media-player
      ref={ref}
      src={src}
      video-title={videoTitle}
      volume={volume}
    />
  );
}

export default function StabilityPage() {
  return (
    <main>
      <h2>2. Stability — media player under parent re-renders</h2>
      <Explainer>
        <p>
          <strong>Tests:</strong> does video playback survive an aggressive
          React parent? Same harness drives our <code>&lt;media-player&gt;</code>{" "}
          WC and the pure-React player side by side.
        </p>
        <ul>
          <li>Press play on BOTH players first.</li>
          <li>
            Crank the re-render slider to 20/s, type in the title prop, move
            the volume prop — reset counters should stay at 0 (React doesn't
            touch an unchanged <code>&lt;video&gt;</code>).
          </li>
          <li>
            "reparent" and "remount via key" destroy both players — playback
            restarts from 0 on both flavors. Watch each player's{" "}
            <code>resets</code> / dropped-frames line and the event log.
          </li>
        </ul>
      </Explainer>
      <p>
        Start BOTH players, then abuse the knobs. Watch the reset counters and
        the log.
      </p>
      <StressHarness
        render={(s) => (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <WcMediaPlayer
              src={VIDEO_SRC}
              videoTitle={`WC — ${s.title}`}
              volume={s.volume}
            />
            <ReactPlayer
              src={VIDEO_SRC}
              videoTitle={`React — ${s.title}`}
              volume={s.volume}
            />
          </div>
        )}
      />
      <LogPanel />
    </main>
  );
}
