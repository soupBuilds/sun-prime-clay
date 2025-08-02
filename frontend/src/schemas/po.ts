import { z } from 'zod'

/**
 * Material enum must match the back-end Prisma enum exactly.
 */
export const materialEnum = z.enum(['HCL', 'BENTONITE'])

/**
 * Schema for creating or editing a Purchase Order.
 * - expectedDate comes from <input type="date"> as 'YYYY-MM-DD'.
 */
export const poSchema = z.object({
  vendorId:     z.number().int().positive(),
  material:     materialEnum,
  quantityKg:   z.number().positive(),
  unitPriceUSD: z.number().positive(),
  expectedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD'),
  status:       z.enum(['OPEN', 'CANCELLED', 'RECEIVED']).default('OPEN'),
})

/**
 * Type inferred from the schema so forms are fully typed.
 */
export type POInput = z.infer<typeof poSchema>
