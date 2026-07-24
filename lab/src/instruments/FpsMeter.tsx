import { useEffect, useState } from "react";

export function FpsMeter() {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = requestAnimationFrame(function loop(now) {
      frames += 1;
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <span style={{ fontFamily: "monospace", fontSize: 12 }}>fps: {fps}</span>
  );
}
