import { z } from 'zod'

export const CreateAttributeSchema = z.object({
  attributeName: z.string().min(1, 'Attribute name is required'),
  description:   z.string().optional(),
  values:        z.array(z.string().min(1)).min(1, 'At least one value required'),
})

export const UpdateAttributeSchema = CreateAttributeSchema.partial()

export type CreateAttributeInput = z.infer<typeof CreateAttributeSchema>
export type UpdateAttributeInput = z.infer<typeof UpdateAttributeSchema>
