import { useEffect, useRef } from "react";
import "../../wc/media-player";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
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
