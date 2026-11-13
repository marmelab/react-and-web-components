import { useEffect, useRef } from "react";
import "../../wc/media-player";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
import { Explainer } from "../../instruments/Explainer";
import { PageHeader } from "../../instruments/PageHeader";
import { ReactPlayer } from "../../react-player/ReactPlayer";
import { VIDEO_SRC } from "../../videoSrc";
import { StressHarness } from "./StressHarness";

// React 19 strips `on` from a JSX event prop and listens for the rest
// verbatim, so `onPlayStateChange` waits for a "PlayStateChange" event that
// never comes: no `[page]` log line ever appeared here despite real play/pause
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
      <PageHeader
        path="/stability"
        lede="A media player under an aggressive React parent: the web component and its pure-React twin, side by side."
      />
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
            touch an unchanged <code>&lt;video&gt;</code>) (the short demo clip
            ending/restarting during a long soak can bump the counters on its
            own — that's the video, not React).
          </li>
          <li>
            "reparent" and "remount via key" destroy both players — playback
            restarts from 0 on both flavors. Watch each player's{" "}
            <code>resets</code> / dropped-frames line and the event log.
          </li>
          <li>
            "move WC via DOM" moves the same <code>&lt;media-player&gt;</code>{" "}
            element to the other container with <code>appendChild</code>,
            without React: it logs a disconnect/connect pair and keeps playing.
            Only the WC gets this button: it is a single opaque node, while the
            React player's DOM belongs to React. Reparent and remount move it
            back first, so React doesn't leave it behind.
          </li>
        </ul>
      </Explainer>
      <p className="lab-hint">
        <strong>Start both players</strong>, then abuse the knobs. Watch the
        reset counters and the log.
      </p>
      <StressHarness
        domMoveSelector="media-player"
        render={(s) => (
          <div className="lab-players">
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
