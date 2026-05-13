import { z } from 'zod'

export const registerSchema = z.object({
  email:      z.string().email('Invalid email'),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  mobile:     z.string().optional(),
  role:       z.enum(['USER', 'DPO_ADMIN', 'DPO_OPS', 'AUDITOR']).optional(),
  isMinor:    z.boolean().optional(),
  guardianId: z.string().optional()
})

export const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required')
})
