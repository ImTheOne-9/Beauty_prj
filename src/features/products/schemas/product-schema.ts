import { z } from 'zod'

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().url(),
  description: z.string(),
  reason: z.string(),
  externalLink: z.string().url(),
  category: z.string(),
  brand: z.string().nullable().optional(),
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable().optional(),
        colorHex: z.string(),
        texture: z.string().nullable().optional(),
        shimmerColor: z.string().nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        sku: z.string().nullable().optional(),
      }),
    )
    .optional(),
})

export type ProductSchema = z.infer<typeof productSchema>
