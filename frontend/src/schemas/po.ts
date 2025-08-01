import { z } from 'zod'

export const poSchema = z.object({
  vendorId:     z.number().int().positive(),
  material:     z.enum(['HCL','BENTONITE']),
  quantityKg:   z.number().positive(),
  unitPriceUSD: z.number().positive(),
  expectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD date'),
  status:       z.enum(['OPEN','CANCELLED','RECEIVED']).default('OPEN'),
})

export type POInput = z.infer<typeof poSchema>
