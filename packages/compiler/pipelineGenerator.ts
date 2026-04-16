import { ArchitectureGraph } from "@repo/types";
import {validateGraph,ValidationIssue} from "@repo/validation"

export interface CompilerManifest {
  models: CompiledModel[];
  routes: CompiledRoute[];
  workflows: CompiledWorkflow[];
}

export interface CompiledModel {
  tableName: string;
  primaryKey: string;
  fieldCount: number;
}

export interface CompiledRoute {
  method: string;
  path: string;
  handlerId: string;
}

export interface CompiledWorkflow {
  triggerEvent: string;
  executionSteps: number;
}

export interface CompilationResult {
  success: boolean;
  issues: ValidationIssue[];
  manifest: CompilerManifest | null;
}

/**
 * Lowers the Architecture Graph into an executable Compiler Manifest.
 * Halts if structural errors are detected by the Validation Engine.
 */
export const compileGraph = (graph: ArchitectureGraph): CompilationResult => {
  // 1. Pre-flight Validation
  const issues = validateGraph(graph);
  const fatalErrors = issues.filter((issue) => issue.severity === "error");

  // 2. Compilation Halt Check
  if (fatalErrors.length > 0) {
    return {
      success: false,
      issues,
      manifest: null,
    };
  }

  // 3. Generate Intermediate Representation (IR)
  const manifest: CompilerManifest = {
    models: Object.values(graph.entities).map((entity) => ({
      tableName: entity.name.toLowerCase(),
      primaryKey: entity.primaryKey,
      fieldCount: entity.fields.length,
    })),
    
    routes: graph.endpoints.map((ep) => ({
      method: ep.method.toUpperCase(),
      path: ep.path,
      handlerId: `${ep.method.toLowerCase()}_${ep.entity.toLowerCase()}`,
    })),

    workflows: graph.workflows.map((wf) => ({
      triggerEvent: wf.triggerEvent,
      executionSteps: wf.steps.length,
    })),
  };

  return {
    success: true,
    issues, // Pass along any warnings
    manifest,
  };
};