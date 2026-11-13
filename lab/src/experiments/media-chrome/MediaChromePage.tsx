import { useRef, useState } from "react";
import "media-chrome";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
import { Explainer } from "../../instruments/Explainer";
import { PageHeader } from "../../instruments/PageHeader";
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
      <PageHeader
        path="/media-chrome"
        lede="Real-world validation: a production web-component player under the same stress harness."
      />
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
      <div className="lab-toolbar">
        <span className="lab-stat" data-hot={resets > 0}>
          playback resets <strong>{resets}</strong>
        </span>
        <span className="lab-hint">
          Same harness as /stability: press play, then abuse the knobs.
        </span>
      </div>
      <StressHarness
        render={(s) => (
          <div>
            <p className="lab-caption">
              {s.title} (tick {s.tick})
            </p>
            <media-controller className="lab-media-chrome">
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
