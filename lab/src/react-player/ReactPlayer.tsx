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
    setResets((r) => {
      logEvent("react-player", `PLAYBACK RESET #${r + 1}: ${why}`);
      return r + 1;
    });
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
    <div
      style={{
        border: "2px solid #a60",
        borderRadius: 6,
        padding: 8,
        maxWidth: 480,
      }}
    >
      <strong>{videoTitle}</strong> <RenderBadge name="ReactPlayer" />
      <video
        ref={videoRef}
        src={src}
        style={{ width: "100%", background: "#000" }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEmptied={() => { countReset("emptied (src reset)"); lastTime.current = 0; }}
        onTimeUpdate={onTimeUpdate}
      />
      <div
        style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}
      >
        <button onClick={() => (playing ? v?.pause() : void v?.play())}>
          {playing ? "⏸" : "▶"}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          step={0.1}
          style={{ flex: 1 }}
          value={v?.duration ? (time / v.duration) * 100 : 0}
          onChange={(e) => {
            if (v?.duration)
              v.currentTime = (Number(e.target.value) / 100) * v.duration;
          }}
        />
        <span>{time.toFixed(1)}s</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          defaultValue={1}
          title="volume"
          onChange={(e) => {
            if (v) v.volume = Number(e.target.value);
          }}
        />
      </div>
      <div style={{ font: "11px monospace", color: "#a00" }}>
        resets: {resets} | dropped frames: {v?.getVideoPlaybackQuality ? v.getVideoPlaybackQuality().droppedVideoFrames : "n/a"}
      </div>
    </div>
  );
}
