import { z } from "zod";

export const GroupFieldOptionSchema = z.object({
  label: z.string().min(1, "Option label is required").max(100),
  value: z.string().min(1, "Option value is required").max(255),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const GroupFieldSchema = z.object({
  name: z.string().min(1, "Field name is required").max(150),
  key: z.string().min(1, "Field key is required").max(100).optional(),
  type: z
    .enum(["text", "textarea", "number", "boolean", "dropdown"])
    .default("text"),
  isRequired: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  options: z.array(GroupFieldOptionSchema).default([]),
});

export const CreateGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(150),
  description: z.string().max(5000).nullable().optional(),
  isActive: z.boolean().default(true),
  fields: z.array(GroupFieldSchema).default([]),
});

export const UpdateGroupSchema = CreateGroupSchema.partial();

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>;
