import { useEffect, useRef, useState } from "react";
import { logEvent } from "../instruments/log";
import { RenderBadge } from "../instruments/RenderBadge";

export function ReactPlayer({
  src,
  videoTitle,
  volume,
}: {
  src: string;
  videoTitle: string;
  volume?: number;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTime = useRef(0);
  const resetSeq = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [resets, setResets] = useState(0);

  useEffect(() => {
    logEvent("react-player", "mounted (useEffect)");
    return () => logEvent("react-player", "unmounted (cleanup)");
  }, []);

  useEffect(() => {
    if (volume !== undefined && videoRef.current)
      videoRef.current.volume = volume;
  }, [volume]);

  const countReset = (why: string) => {
    resetSeq.current += 1;
    logEvent("react-player", `PLAYBACK RESET #${resetSeq.current}: ${why}`);
    setResets(resetSeq.current);
  };

  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const t = v.currentTime;
    if (t < lastTime.current - 0.5)
      countReset(
        `time jumped back ${lastTime.current.toFixed(1)} → ${t.toFixed(1)}`,
      );
    lastTime.current = t;
    setTime(t);
  };

  const v = videoRef.current;
  return (
    <div className="lab-player">
      <div className="lab-player-title">
        <strong>{videoTitle}</strong> <RenderBadge name="ReactPlayer" />
      </div>
      <video
        ref={videoRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEmptied={() => { countReset("emptied (src reset)"); lastTime.current = 0; }}
        onTimeUpdate={onTimeUpdate}
      />
      <div className="lab-player-row">
        <button
          className="lab-player-toggle"
          onClick={() => { const vid = videoRef.current; if (!vid) return; playing ? vid.pause() : void vid.play(); }}
        >
          {playing ? "⏸" : "▶"}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={v?.duration ? (time / v.duration) * 100 : 0}
          onChange={(e) => {
            const vid = videoRef.current;
            if (vid?.duration)
              vid.currentTime = (Number(e.target.value) / 100) * vid.duration;
          }}
        />
        <span className="lab-player-time">{time.toFixed(1)}s</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={1}
          title="volume"
          onChange={(e) => {
            const vid = videoRef.current;
            if (vid) vid.volume = Number(e.target.value);
          }}
        />
      </div>
      <div className="lab-player-stats">
        resets: {resets} | dropped frames: {v?.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().droppedVideoFrames : "n/a"}
      </div>
    </div>
  );
}
