import { useRef, useState } from "react";
import "media-chrome";
import { logEvent } from "../../instruments/log";
import { LogPanel } from "../../instruments/LogPanel";
import { VIDEO_SRC } from "../../videoSrc";
import { StressHarness } from "../stability/StressHarness";

export default function MediaChromePage() {
  const lastTime = useRef(0);
  const [resets, setResets] = useState(0);
  const countReset = (why: string) => {
    setResets((r) => {
      logEvent("media-chrome", `PLAYBACK RESET #${r + 1}: ${why}`);
      return r + 1;
    });
  };

  return (
    <main>
      <h2>5. Real-world validation: media-chrome</h2>
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
