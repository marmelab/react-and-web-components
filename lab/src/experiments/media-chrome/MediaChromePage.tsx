import { useRef, useState } from "react";
import "media-chrome";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
import { Explainer } from "../../instruments/Explainer";
import { VIDEO_SRC } from "../../videoSrc";
import { StressHarness } from "../stability/StressHarness";

export default function MediaChromePage() {
  const lastTime = useRef(0);
  const resetSeq = useRef(0);
  const [resets, setResets] = useState(0);
  const countReset = (why: string) => {
    resetSeq.current += 1;
    logEvent("media-chrome", `PLAYBACK RESET #${resetSeq.current}: ${why}`);
    setResets(resetSeq.current);
  };

  return (
    <main>
      <h2>5. Real-world validation: media-chrome</h2>
      <Explainer>
        <p>
          <strong>Tests:</strong> whether the /stability findings hold for a
          production web component player (media-chrome), under the identical
          stress harness.
        </p>
        <ul>
          <li>
            Press play, then run the same knobs as /stability: re-render
            crank, reparent, key remount.
          </li>
          <li>
            Note: this page's reset counter lives OUTSIDE the remounted
            subtree, so a teardown while playback had elapsed can log an
            artifact reset — it's state-dependent, not per-remount;
            /stability's per-player counters count differently by design.
          </li>
        </ul>
      </Explainer>
      <p>
        Same harness as /stability. resets: <strong>{resets}</strong>
      </p>
      <StressHarness
        render={(s) => (
          <div>
            <p>
              {s.title} (tick {s.tick})
            </p>
            <media-controller style={{ maxWidth: 480 }}>
              <video
                slot="media"
                src={VIDEO_SRC}
                onEmptied={() => countReset("emptied (src reset)")}
                onTimeUpdate={(e) => {
                  const t = e.currentTarget.currentTime;
                  if (t < lastTime.current - 0.5)
                    countReset(
                      `time jumped back ${lastTime.current.toFixed(1)} → ${t.toFixed(1)}`,
                    );
                  lastTime.current = t;
                }}
              />
              <media-control-bar>
                <media-play-button></media-play-button>
                <media-time-range></media-time-range>
                <media-time-display></media-time-display>
                <media-mute-button></media-mute-button>
                <media-volume-range></media-volume-range>
              </media-control-bar>
            </media-controller>
          </div>
        )}
      />
      <LogPanel />
    </main>
  );
}
