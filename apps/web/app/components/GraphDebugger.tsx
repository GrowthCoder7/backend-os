"use client";

import { useGraphStore } from "@repo/store";

export function GraphDebugger() {
  const graph = useGraphStore((state) => state.graph);
  const addEntity = useGraphStore((state) => state.addEntity);

  const handleTestMutation = () => {
    try {
      addEntity({
        name: "TestUser",
        primaryKey: "id",
        fields: [
          { name: "id", type: "string", required: true },
          { name: "role", type: "string", required: true }
        ]
      });
    } catch (e) {
      console.warn("Mutation rejected: Entity likely already exists.");
    }
  };

  return (
    <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>AST Memory State</h2>
        <button 
          onClick={handleTestMutation}
          style={{ 
            padding: "0.5rem 1rem", 
            background: "var(--foreground)", 
            color: "var(--background)", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer", 
            fontFamily: "inherit",
            fontWeight: "500"
          }}
        >
          Inject Test Entity
        </button>
      </div>
      <pre style={{ 
        background: "#111111", 
        padding: "1.5rem", 
        borderRadius: "6px", 
        color: "#10b981", 
        overflowX: "auto", 
        fontSize: "0.875rem",
        lineHeight: "1.5"
      }}>
        <code>{JSON.stringify(graph, null, 2)}</code>
      </pre>
    </div>
  );
}