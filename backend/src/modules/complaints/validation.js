import { z } from 'zod'

export const createComplaintSchema = z.object({
  dataPrincipalId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Data Principal ID'),
  consentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Consent ID').optional(),
  subject: z.string().min(1, 'Subject is required').max(255),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  evidence: z.record(z.any()).optional()
})

export const updateStatusSchema = z.object({
  status: z.enum(['RECEIVED', 'UNDER_REVIEW', 'ESCALATED', 'CLOSED'])
})

export const assignComplaintSchema = z.object({
  assignedTo: z.string().min(1, 'Assignee is required')
})
