import { useSyncExternalStore, type ReactNode } from "react";
import { clearLog, getLogEntries, subscribeLog } from "./log";

// Words in a log message that name the channel React used, each colored by
// kind: a property write, an attribute change, a custom-element callback, a
// DOM event, or a line that reports a problem.
const CHANNEL =
  /(PROPERTY|attributeChanged(?:Callback)?|constructor\(\)|connectedCallback|disconnectedCallback|onProbeEvent|'onprobe-event'|probe-event|inner-event(?:-scoped)?|play-state-change|PLAYBACK RESET #\d+|should NOT happen)/;

function channelKind(token: string): string {
  if (token === "PROPERTY") return "property";
  if (token.startsWith("attributeChanged")) return "attribute";
  if (/^(constructor|connected|disconnected)/.test(token)) return "lifecycle";
  if (token.startsWith("PLAYBACK RESET") || token === "should NOT happen")
    return "bad";
  return "event";
}

// The text stays exactly the message: only spans are added around words.
function highlight(message: string): ReactNode[] {
  return message.split(CHANNEL).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={`lab-ch-${channelKind(part)}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

// Who logged the line: the web components (default), the pure-React player,
// the page itself or the stress harness.
function sourceKind(source: string): string {
  if (source === "react-player") return "react";
  if (source === "page" || source === "harness") return source;
  return "wc";
}

export function LogPanel() {
  const entries = useSyncExternalStore(
    subscribeLog,
    getLogEntries,
    getLogEntries,
  );
  return (
    <section className="lab-log">
      <div className="lab-log-head">
        <span className="lab-log-title">
          Event log <span className="lab-log-n">{entries.length}</span>
        </span>
        <button onClick={clearLog}>clear</button>
      </div>
      {entries.length === 0 ? (
        <div className="lab-log-empty">
          No events yet. Press a button above.
        </div>
      ) : (
        <ol className="lab-log-list">
          {entries
            .slice(-200)
            .reverse()
            .map((e) => (
              <li key={e.id}>
                <span className="lab-log-t">
                  {e.t.toFixed(1).padStart(9)}ms
                </span>{" "}
                <span className="lab-log-src" data-kind={sourceKind(e.source)}>
                  [{e.source}]
                </span>{" "}
                {highlight(e.message)}
              </li>
            ))}
        </ol>
      )}
    </section>
  );
}
