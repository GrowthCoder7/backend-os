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
        if (state.graph.entities[entity.name]) {
            throw new Error(`Entity ${entity.name} already exists.`);
        }
        state.graph.entities[entity.name] = entity;
      }),

    updateEntity: (oldName, partialEntity) =>
      set((state) => {
        const entity = state.graph.entities[oldName];
        if (!entity) return;

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
          Object.assign(state.graph.entities[oldName], partialEntity);
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