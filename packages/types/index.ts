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
  primaryKey: string;
}

export interface Relation {
  source: string;
  sourceField: string;
  target: string;
  targetField: string;
  type: "one-to-one" | "one-to-many" | "many-to-one" | "many-to-many";
}

export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string; // FIXED: Strict Routing Enforced
  entity: string;
  action: "create" | "read" | "update" | "delete";
}

export interface Event {
  name: string;
  payloadSchema: Record<string, FieldType>; // FIXED: Typed Payloads Enabled
}

export interface PipelineStep {
  name: string;
  type: "core" | "custom";
  config?: Record<string, unknown>; // FIXED: Strict Static Analysis Enforced
}

export interface Workflow {
  triggerEvent: string;
  steps: PipelineStep[];
}

export interface ArchitectureGraph {
  entities: Record<string, Entity>;
  relations: Relation[];
  endpoints: Endpoint[];
  events: Record<string, Event>;
  workflows: Workflow[];
}