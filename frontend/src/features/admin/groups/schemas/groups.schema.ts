import { z } from 'zod'

export const CreateGroupSchema = z.object({
  groupName:   z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
})

export const UpdateGroupSchema = CreateGroupSchema.partial()

export type CreateGroupInput = z.infer<typeof CreateGroupSchema>
export type UpdateGroupInput = z.infer<typeof UpdateGroupSchema>
