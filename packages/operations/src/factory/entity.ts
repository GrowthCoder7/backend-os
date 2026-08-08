import { ArchitectureOperation } from "../operation";
import { OperationMetadata } from "../metadata";
import { CreateEntityPayload } from "../entity/create";
import { UpdateEntityPayload } from "../entity/update";
import { DeleteEntityPayload } from "../entity/delete";

// Utility for ID generation without relying on external packages
const generateId = (): string => {
  return typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

// Utility to ensure metadata is always present
const createDefaultMetadata = (metadata?: Partial<OperationMetadata>): OperationMetadata => ({
  timestamp: new Date().toISOString(),
  ...metadata,
});

export const createEntityOperation = (
  payload: CreateEntityPayload,
  metadata?: Partial<OperationMetadata>
): ArchitectureOperation<"entity.create", CreateEntityPayload> => ({
  id: generateId(),
  type: "entity.create",
  payload,
  metadata: createDefaultMetadata(metadata),
});

export const updateEntityOperation = (
  payload: UpdateEntityPayload,
  metadata?: Partial<OperationMetadata>
): ArchitectureOperation<"entity.update", UpdateEntityPayload> => ({
  id: generateId(),
  type: "entity.update",
  payload,
  metadata: createDefaultMetadata(metadata),
});

export const deleteEntityOperation = (
  payload: DeleteEntityPayload,
  metadata?: Partial<OperationMetadata>
): ArchitectureOperation<"entity.delete", DeleteEntityPayload> => ({
  id: generateId(),
  type: "entity.delete",
  payload,
  metadata: createDefaultMetadata(metadata),
});