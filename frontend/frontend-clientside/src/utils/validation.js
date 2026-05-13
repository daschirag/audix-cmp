import { z } from 'zod';

/* ── Shared field schemas ── */
const emailSchema = z
  .string()
  .min(1, 'Email address is required')
  .email('Enter a valid email address (e.g. you@example.com)');

const indianPhoneSchema = z
  .string()
  .min(1, 'Mobile number is required')
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit number starting with 6, 7, 8, or 9');

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter (A–Z)')
  .regex(/[0-9]/, 'Must contain at least one number (0–9)');

const nameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .regex(/^[^0-9]*$/, 'Name cannot contain numbers');

/* ── Login schema ── */
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or phone number is required')
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ||
        /^[6-9]\d{9}$/.test(val.trim()),
      'Enter a valid email address or 10-digit mobile number'
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

/* ── Signup schema ── */
const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: indianPhoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/* ── validateLogin — returns errors object for submit ── */
export function validateLogin(identifier, password) {
  const result = loginSchema.safeParse({ identifier, password });
  if (result.success) return {};
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path[0], issue.message])
  );
}

/* ── validateLoginField — single field for onBlur ── */
export function validateLoginField(name, value) {
  const fieldSchemas = {
    identifier: loginSchema.shape.identifier,
    password: loginSchema.shape.password,
  };
  const schema = fieldSchemas[name];
  if (!schema) return '';
  const result = schema.safeParse(value);
  if (result.success) return '';
  return result.error.issues[0]?.message || '';
}

/* ── validateSignup — returns errors object for submit ── */
export function validateSignup(data) {
  const result = signupSchema.safeParse(data);
  if (result.success) return {};
  const errors = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0];
    if (field && !errors[field]) errors[field] = issue.message;
  });
  return errors;
}

/* ── validateSignupField — single field for onBlur/onChange ── */
export function validateSignupField(name, value, allData = {}) {
  // For confirmPassword we need the full object to check match
  if (name === 'confirmPassword') {
    const result = signupSchema.safeParse({
      name: allData.name || 'A',         // dummy valid values for other fields
      email: allData.email || 'a@b.com',
      phone: allData.phone || '9000000000',
      password: allData.password || '',
      confirmPassword: value,
    });
    if (result.success) return '';
    const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword');
    return issue?.message || '';
  }

  const fieldSchemas = {
    name: nameSchema,
    email: emailSchema,
    phone: indianPhoneSchema,
    password: passwordSchema,
  };
  const schema = fieldSchemas[name];
  if (!schema) return '';
  const result = schema.safeParse(value);
  if (result.success) return '';
  return result.error.issues[0]?.message || '';
}