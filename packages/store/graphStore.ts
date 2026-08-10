// /packages/store/graphStore.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { 
  ArchitectureGraph, 
  Entity, 
  Relation, 
  Endpoint, 
  Event, 
  Workflow 
} from "@repo/types";

import {current} from 'immer'
import {validateGraph} from '@repo/validation'

// IMPORT DEV A'S CANONICAL FACTORY
import { createEntityOperation } from "@repo/operations";
import { OperationExecutor, OperationRegistry, EntityCreateHandler } from "@repo/executor";

const registry = new OperationRegistry();
registry.register("entity.create", new EntityCreateHandler());
const executor = new OperationExecutor(registry);

// The shape of our store encompasses the core graph and atomic mutators.
interface GraphState {
  graph: ArchitectureGraph;
  
  // Atomic Mutators
  addEntity: (entity: Entity) => void;
  updateEntity: (name: string, partialEntity: Partial<Entity>) => void;
  removeEntity: (name: string) => void;
  
  addRelation: (relation: Relation) => void;
  
  addEndpoint: (endpoint: Endpoint) => void;
  updateEndpointPath: (method: string, oldPath: string, newPath: string) => void;
  
  addEvent: (event: Event) => void;
  addWorkflow: (workflow: Workflow) => void;
}

const initialGraph: ArchitectureGraph = {
  metadata: {
    id: "default-project",
    name: "Default Project",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    compilerVersion: "1.0.0",
    schemaVersion: "1.0.0"
  },
  entities: {},
  relations: [],
  endpoints: [],
  events: {},
  workflows: [],
};

export const useGraphStore = create<GraphState>()(
  immer((set) => ({
    graph: initialGraph,

    // O(1) Normalization allows direct assignment
    addEntity: (entity) =>
      set((state) => {
        // 1. DELEGATE TO DEV A'S FACTORY (Handles ID, Type, Metadata, Payload)
        const operation = createEntityOperation({ entity });

        // 2. CONSTRUCT CONTEXT
        const context = {
          graph: current(state.graph),
          services: {},
          validation: { validate: validateGraph }
        };

        // 3. EXECUTE
        const result = executor.execute(operation, context);

        // 4. ROLLBACK / ERROR BUBBLING
        if (!result.success) {
          const errors = result.diagnostics
            .filter(d => d.severity === "error")
            .map(d => d.message).join(" | ");
          throw new Error(errors);
        }

        // 5. COMMIT IMMUTABLE AST
        state.graph = result.graph;
      }),

    updateEntity: (oldName, partialEntity) =>
      set((state) => {
        const entity = state.graph.entities[oldName];
        if (!entity){
          throw new Error(`Entity '${oldName} not found'`)
        };

        const newName = partialEntity.name;
        const isRenaming = newName !== undefined && newName !== oldName;

        if (isRenaming) {
          // 1. Collision Check
          if (state.graph.entities[newName]) {
            throw new Error(`Cannot rename: Entity "${newName}" already exists.`);
          }

          // 2. Construct new entity and assign to new key
          state.graph.entities[newName] = { ...entity, ...partialEntity };

          // 3. Delete old key to maintain O(1) integrity
          delete state.graph.entities[oldName];

          // 4. Synchronous Cascading Update: Relations (SCHEMA CORRECTED)
          state.graph.relations.forEach((rel) => {
            if (rel.source === oldName) rel.source = newName; 
            if (rel.target === oldName) rel.target = newName; 
          });

          // 5. Synchronous Cascading Update: Endpoints
          state.graph.endpoints.forEach((ep) => {
            if (ep.entity === oldName) ep.entity = newName;
          });
        } else {
          // Standard field update (no rename)
          const entity = state.graph.entities[oldName]
          if(!entity){
            throw new Error(`Entity '${oldName}' not found`)
          }
          Object.assign(entity, partialEntity);
        }
      }),

    removeEntity: (name) =>
      set((state) => {
        delete state.graph.entities[name];
        // Note: Cascading deletes for relations/endpoints will be handled 
        // by the validation engine middleware later.
      }),

    addRelation: (relation) =>
      set((state) => {
        state.graph.relations.push(relation);
      }),

    addEndpoint: (endpoint) =>
      set((state) => {
        state.graph.endpoints.push(endpoint);
      }),

    updateEndpointPath: (method, oldPath, newPath) =>
      set((state) => {
        const target = state.graph.endpoints.find(
          (ep) => ep.method === method && ep.path === oldPath
        );
        if (target) target.path = newPath;
      }),

    addEvent: (event) =>
      set((state) => {
        state.graph.events[event.name] = event;
      }),

    addWorkflow: (workflow) =>
      set((state) => {
        state.graph.workflows.push(workflow);
      }),
  }))
);