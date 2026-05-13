// src/utils/consentSchema.js
// Zod validation schema for the DPDPA Consent Form
// Install: npm install zod

import { z } from 'zod';

/* ── Guardian sub-schema (only enforced when isMinor === true) ── */
export const guardianSchema = z.object({
  name: z
    .string()
    .min(2, 'Guardian full name must be at least 2 characters')
    .max(100, 'Guardian name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Guardian name should contain only letters and spaces'),

  relation: z
    .string()
    .min(1, 'Please specify the relationship to the minor'),

  phone: z
    .string()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number too long')
    .regex(/^[+]?[\d\s\-()]+$/, 'Enter a valid mobile number'),

  email: z
    .string()
    .email('Enter a valid email address')
    .max(255, 'Email address too long'),
});

/* ── Guardian agreements sub-schema ── */
export const guardianAgreementsSchema = z.object({
  c1: z.literal(true, {
    errorMap: () => ({ message: 'Guardian must consent to contact data collection' }),
  }),
  c2: z.literal(true, {
    errorMap: () => ({ message: 'Guardian must provide consent on behalf of the minor' }),
  }),
});

/* ─────────────────────────────────────────────────────────────────
   ALL mandatory consent IDs across the 14 categories.
   These must be checked (true) before the form can be submitted.
───────────────────────────────────────────────────────────────── */
export const MANDATORY_CONSENT_IDS = [
  // Category 1 – Basic Identity
  '1-1', '1-3',
  // Category 2 – Contact Details
  '2-1', '2-7',
  // Category 3 – KYC Documentation
  '3-1', '3-2',
  // Category 4 – Financial Profile
  '4-1', '4-3',
  // Category 6 – Banking Information
  '6-1', '6-3', '6-4',
  // Category 7 – Nominee Information
  '7-1', '7-2', '7-3',
  // Category 8 – Risk Profile Assessment
  '8-1', '8-2', '8-3',
  // Category 12 – Access Credentials
  '12-1', '12-2',
  // Category 13 – Tax-Related Information
  '13-1',
  // Category 14 – Regulatory Compliance
  '14-1', '14-2',
];

/* ── Consent selections schema ─────────────────────────────────── */
// selected is a flat map: { [consentId: string]: boolean }
// We validate that every mandatory ID is true.
export const consentSelectionsSchema = z
  .record(z.string(), z.boolean())
  .superRefine((selected, ctx) => {
    const missing = MANDATORY_CONSENT_IDS.filter((id) => !selected[id]);
    if (missing.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing mandatory consents: ${missing.join(', ')}`,
        path: ['mandatoryConsents'],
      });
    }
  });

/* ── Root form schema ───────────────────────────────────────────── */
export const consentFormSchema = z
  .object({
    lang: z.enum(['en', 'hi', 'ta']),
    isMinor: z.boolean(),
    guardian: guardianSchema.optional(),
    guardianAgreements: guardianAgreementsSchema.optional(),
    selected: consentSelectionsSchema,
  })
  .superRefine((data, ctx) => {
    if (data.isMinor) {
      // Guardian fields become required
      const guardianResult = guardianSchema.safeParse(data.guardian ?? {});
      if (!guardianResult.success) {
        guardianResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['guardian', ...(issue.path ?? [])],
          });
        });
      }

      // Guardian agreement checkboxes become required
      const agreementsResult = guardianAgreementsSchema.safeParse(
        data.guardianAgreements ?? {}
      );
      if (!agreementsResult.success) {
        agreementsResult.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['guardianAgreements', ...(issue.path ?? [])],
          });
        });
      }
    }
  });

/* ── Helpers ──────────────────────────────────────────────────── */

/**
 * Returns an array of missing mandatory consent IDs given the current
 * `selected` map.  Useful for showing inline error lists.
 */
export function getMissingMandatoryIds(selected = {}) {
  return MANDATORY_CONSENT_IDS.filter((id) => !selected[id]);
}

/**
 * Returns the percentage of mandatory consents that have been given.
 */
export function getMandatoryProgress(selected = {}) {
  const done = MANDATORY_CONSENT_IDS.filter((id) => !!selected[id]).length;
  return {
    done,
    total: MANDATORY_CONSENT_IDS.length,
    pct: Math.round((done / MANDATORY_CONSENT_IDS.length) * 100),
  };
}