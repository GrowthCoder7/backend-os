"use client";

import { useState } from "react";
import { useGraphStore } from "@repo/store";
import { validateGraph } from "@repo/validation";
import { ArchitectureGraph, Entity } from "@repo/types";

export function EntityBuilder() {
  const addEntity = useGraphStore((state) => state.addEntity);
  const currentGraph = useGraphStore((state) => state.graph);

  const [name, setName] = useState("");
  const [primaryKey, setPrimaryKey] = useState("id");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = () => {
    // 1. Construct provisional entity with mandatory PK field
    const newEntity: Entity = {
      name,
      primaryKey,
      fields: [{ name: primaryKey, type: "string", required: true }] 
    };

    // 2. Build provisional AST for pure validation
    const provisionalGraph: ArchitectureGraph = {
      ...currentGraph,
      entities: { ...currentGraph.entities, [name]: newEntity }
    };

    // 3. Run semantic analysis
    const issues = validateGraph(provisionalGraph);
    const fatalErrors = issues.filter(issue => issue.severity === "error");

    // 4. Explicit UI Rejection
    if (fatalErrors.length > 0) {
      setError(fatalErrors.map(e => e.message).join(" | "));
      return;
    }

    // 5. Dispatch Validated State
    try {
      addEntity(newEntity);
      setError(null);
      setName("");
      setPrimaryKey("id");
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ padding: "1.5rem", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "2rem" }}>
      <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Entity Builder</h2>
      
      {error && (
        <div style={{ background: "#450a0a", color: "#fca5a5", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.875rem" }}>
          ⚠️ VALIDATION REJECTED: {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <input
          placeholder="Entity Name (e.g., User)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: "0.5rem", background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "4px" }}
        />
        <input
          placeholder="Primary Key"
          value={primaryKey}
          onChange={(e) => setPrimaryKey(e.target.value)}
          style={{ padding: "0.5rem", background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", borderRadius: "4px" }}
        />
        <button 
          onClick={handleCreate} 
          style={{ padding: "0.5rem 1rem", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
        >
          Define Entity
        </button>
      </div>
    </div>
  );
}