export type LogEntry = {
  id: number;
  t: number;
  source: string;
  message: string;
};

let entries: LogEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      // swallow errors; instrument must never break the code it observes
    }
  });
}

export function logEvent(source: string, message: string): void {
  entries = [
    ...entries,
    { id: nextId++, t: performance.now(), source, message },
  ];
  notify();
}

export function clearLog(): void {
  entries = [];
  notify();
}

export function subscribeLog(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getLogEntries(): LogEntry[] {
  return entries;
}
