import { Entity } from "@repo/types";

export type UpdateEntityPayload = {
  name: string;
  partialEntity: Partial<Entity>;
};