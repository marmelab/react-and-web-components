import { useSyncExternalStore } from "react";
import { clearLog, getLogEntries, subscribeLog } from "./log";

export function LogPanel() {
  const entries = useSyncExternalStore(
    subscribeLog,
    getLogEntries,
    getLogEntries,
  );
  return (
    <section
      style={{
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: 8,
        marginTop: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>Event log ({entries.length})</strong>
        <button onClick={clearLog}>clear</button>
      </div>
      <ol
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          maxHeight: 280,
          overflowY: "auto",
          margin: 0,
        }}
      >
        {entries
          .slice(-200)
          .reverse()
          .map((e) => (
            <li key={e.id} style={{ listStyle: "none" }}>
              <span style={{ color: "#888" }}>
                {e.t.toFixed(1).padStart(9)}ms
              </span>{" "}
              <span style={{ color: "#0a6" }}>[{e.source}]</span> {e.message}
            </li>
          ))}
      </ol>
    </section>
  );
}
