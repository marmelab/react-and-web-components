import { createRoot } from "react-dom/client";
import { useState } from "react";
import "corp-components";
import "corp-components/react";

function App() {
  const [volume, setVolume] = useState(1);
  return (
    <main>
      <h1>React consumer</h1>
      <label>
        volume prop:{" "}
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </label>
      <media-player
        src="https://samplelib.com/mp4/sample-20s.mp4"
        video-title="imported from corp-components, driven by React 19"
        volume={volume}
      />
      <p>
        <a href="/index.html">→ plain HTML consumer of the SAME package</a>
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
