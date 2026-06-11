import { GraphDebugger } from "./components/GraphDebugger";
import { EntityBuilder } from "./components/EntityBuilder";

export default function PlatformShell() {
  return (
    <main style={{ minHeight: "100vh", padding: "4rem" }}>
      <header style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "2rem" }}>
        <h1>Architecture-Driven Backend OS</h1>
        <p style={{ color: "var(--accent)", marginTop: "0.5rem" }}>System State: M2 PARALLEL EXECUTION</p>
      </header>
      
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div>
          <EntityBuilder />
          {/* Future implementation: EndpointBuilder, WorkflowBuilder */}
        </div>
        
        <div>
          <GraphDebugger />
        </div>
      </section>
    </main>
  );
}