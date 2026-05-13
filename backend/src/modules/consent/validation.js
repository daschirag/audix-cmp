import { z } from 'zod'

export const captureConsentSchema = z.object({
  dataPrincipalId: z.string().min(1),
  purposes: z
    .array(z.object({ purposeId: z.string().min(1) }).passthrough())
    .min(1, 'At least one purpose is required'),
  language: z.string().min(1),
  noticeVersionId: z.string().min(1),
  source: z.union([z.string().min(1), z.object({}).passthrough()]),
  expiresAt: z.string().datetime({ offset: true }).optional(),
})
