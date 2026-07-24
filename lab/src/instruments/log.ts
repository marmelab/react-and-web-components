export type LogEntry = {
  id: number;
  t: number;
  source: string;
  message: string;
};

let entries: LogEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

export function logEvent(source: string, message: string): void {
  entries = [
    ...entries,
    { id: nextId++, t: performance.now(), source, message },
  ];
  listeners.forEach((l) => l());
}

export function clearLog(): void {
  entries = [];
  listeners.forEach((l) => l());
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
