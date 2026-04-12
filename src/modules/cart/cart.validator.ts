import { z } from 'zod'

export const cartSchema = z.object({
  quantity: z.number().nonnegative().default(1),
})
