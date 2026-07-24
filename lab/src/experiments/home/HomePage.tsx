export function HomePage() {
  return (
    <main>
      <h2>Experiments</h2>
      <p>
        Each experiment is a route (top nav). Results are shown live in on-page
        instrument panels and recorded in <code>FINDINGS.md</code>. Run each
        experiment in Chrome AND Firefox.
      </p>
      <p>
        React Compiler: wired in Task 10 — start with{" "}
        <code>COMPILER=on pnpm dev</code> to enable it.
      </p>
    </main>
  );
}
