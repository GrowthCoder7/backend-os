/**
 * 🔒 ARCHITECTURE CONTRACT — VERSION 1.1
 * LOCATION: /packages/types/index.ts
 * PURPOSE: Compiler-ready Architecture Graph schema
 */

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "datetime"
  | "relation"
  | "json"
  | "enum";

export interface Field {
  name: string;
  type: FieldType;
  required: boolean;
}

export interface Entity {
  name: string;
  fields: Field[];
  primaryKey?: string; 
}

export interface Relation {
  source: string;
  target: string;
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
}

export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path?: string;
  entity: string;
  action: "create" | "read" | "update" | "delete";
}

export interface Event {
  name: string;
}

export interface PipelineStep {
  name: string;
  type: "core" | "custom";
  config?: Record<string, any>;
}

export interface Workflow {
  triggerEvent: string;
  steps: PipelineStep[];
}

export interface ArchitectureGraph {
  entities: Record<string, Entity>; 
  relations: Relation[];
  endpoints: Endpoint[];
  events: Event[];
  workflows: Workflow[];
}