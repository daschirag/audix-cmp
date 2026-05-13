import { z } from 'zod';

/* ── Shared field schemas ── */
const nameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .regex(/^[^0-9]*$/, 'Name cannot contain numbers');

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Enter a valid email (e.g. you@example.com)');

const indianPhoneSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number starting with 6, 7, 8, or 9');

/* ── Profile schema ── */
const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: indianPhoneSchema,
});

/* ── Complaint schema ── */
const complaintSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters'),
  email: z
    .string()
    .min(1, 'Contact email is required')
    .email('Enter a valid email address'),
});

/* ── validateProfileField — single field for onBlur/onChange ── */
export function validateProfileField(name, value) {
  const fieldSchemas = {
    name: nameSchema,
    email: emailSchema,
    phone: indianPhoneSchema,
  };
  const schema = fieldSchemas[name];
  if (!schema) return '';
  const result = schema.safeParse(value);
  if (result.success) return '';
  return result.error.issues[0]?.message || '';
}

/* ── validateProfile — full object for submit ── */
export function validateProfile(data) {
  const result = profileSchema.safeParse(data);
  if (result.success) return {};
  const errors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  });
  return errors;
}

/* ── validateComplaintField — single field for onBlur/onChange ── */
export function validateComplaintField(name, value) {
  const fieldSchemas = {
    category: complaintSchema.shape.category,
    priority: complaintSchema.shape.priority,
    subject: complaintSchema.shape.subject,
    description: complaintSchema.shape.description,
    email: complaintSchema.shape.email,
  };
  const schema = fieldSchemas[name];
  if (!schema) return '';
  const result = schema.safeParse(value);
  if (result.success) return '';
  return result.error.issues[0]?.message || '';
}

/* ── validateComplaint — full object for submit ── */
export function validateComplaint(data) {
  const result = complaintSchema.safeParse(data);
  if (result.success) return {};
  const errors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  });
  return errors;
}