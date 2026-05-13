# Consent Module — CLAUDE.md

Created by Ramya | Last updated: May 14, 2026 (Sujaa)


## Owners

- Ramya — POST /consent/capture, DELETE /consent/:id/withdraw, GET /consent/status/:principalId
- Sujaa — GET /consent/:id, GET /consent/proof/:consentId (implemented and wired end-to-end)


## What exists in this module


### repository.js

- `createConsent(data)` → ConsentMaster
- `createConsentEvent(data)` → ConsentEvent — append-only, never update or delete this model
- `getConsentByPrincipalId(principalId)` → ConsentMaster[] ordered by createdAt desc
- `withdrawConsent(id)` → ConsentMaster — updates status field ONLY, never deletes
- `findConsentById(id)` → ConsentMaster | null
- `findConsentWithEvents(id)` → ConsentMaster with `events[]` included, events ordered by timestamp asc
- `findActivePurposesByIds(ids)` → PurposeCatalog[] — returns only records where isActive: true
- `findNoticeVersionById(id)` → NoticeVersion | null — used by the proof endpoint
- `writeAuditLog({ actorId, actorRole, action, resource, ip })` → AuditLog


### service.js

- `captureConsent({ dataPrincipalId, purposes, language, noticeVersionId, source, expiresAt }, actor)` → ConsentMaster
  - Validates all purpose IDs against PurposeCatalog (count-match check)
  - Creates ConsentMaster with status ACTIVE
  - Computes SHA-256 hash of event payload and creates GRANTED ConsentEvent
  - Writes AuditLog (action: 'consent.capture')

- `withdrawConsent(consentId, actor)` → ConsentMaster
  - Guards: 404 if record not found, 409 if status is not ACTIVE
  - Updates status to WITHDRAWN via repository
  - Computes SHA-256 hash and creates WITHDRAWN ConsentEvent using existing record's purposes/noticeVersionId
  - Writes AuditLog (action: 'consent.withdraw')

- `getConsentStatus(principalId)` → ConsentMaster[]
  - Plain delegation to repository — no business logic

- `getConsentById(consentId, requestingUser)` → ConsentMaster with `events[]`
  - 404 CONSENT_NOT_FOUND if record does not exist
  - Writes AuditLog (action: 'consent.view') — see "Read-trail audit actions" below

- `getConsentProof(consentId, requestingUser)` → `{ consent, events, noticeVersion }`
  - 404 CONSENT_NOT_FOUND if record does not exist
  - Fetches the linked NoticeVersion separately (no Prisma relation on noticeVersionId)
  - `events` is split out of the consent object so the response shape matches API_CONTRACTS.md exactly — `consent` carries only ConsentMaster fields, `events` is the ordered ledger, `noticeVersion` is the linked notice
  - Writes AuditLog (action: 'consent.proof.view') — see "Read-trail audit actions" below

actor / requestingUser shape: `{ id: string, role: string, ip: string }` — assembled by the controller from req.user + req.ip. Ramya's mutating handlers call the local var `actor`; Sujaa's read handlers call it `requestingUser`. Same shape, different name.


### controller.js

- `capture(req, res)` — POST /consent/capture — Zod-validates body, calls service.captureConsent, 201 on success
- `withdraw(req, res)` — DELETE /consent/:id/withdraw — extracts req.params.id, calls service.withdrawConsent, 200 on success
- `getStatus(req, res)` — GET /consent/status/:principalId — extracts req.params.principalId, calls service.getConsentStatus, 200 on success
- `getById(req, res)` — GET /consent/:id — extracts req.params.id, builds requestingUser, calls service.getConsentById, 200 on success
- `getProof(req, res)` — GET /consent/proof/:consentId — extracts req.params.consentId, builds requestingUser, calls service.getConsentProof, 200 on success

Zod errors are formatted as `"field.path: message; field.path: message"` with code VALIDATION_ERROR.


### validation.js

- `captureConsentSchema` — Zod schema for POST /consent/capture body
  - `dataPrincipalId`: string, required
  - `purposes`: array of objects, each must have `id: string`; extra fields pass through; min 1 item
  - `language`: string, required
  - `noticeVersionId`: string, required
  - `source`: object, extra fields pass through
  - `expiresAt`: ISO 8601 datetime string with timezone offset, optional


### router.js — All routes

- POST   /consent/capture             — auth + rbac('consent:write')   (Ramya)
- DELETE /consent/:id/withdraw        — auth + rbac('consent:write')   (Ramya)
- GET    /consent/status/:principalId — auth + rbac('consent:read')    (Ramya)
- GET    /consent/proof/:consentId    — auth + rbac('consent:read')    (Sujaa)
- GET    /consent/:id                 — auth + rbac('consent:read')    (Sujaa)

Notes:
- DELETE uses consent:write (not consent:delete) so that USER role can withdraw their own consent.
- Route ordering matters: the specific-prefix GETs (`/status/:principalId`, `/proof/:consentId`) must be declared **before** the catch-all `/:id`, otherwise Express will match `/status` and `/proof` as values of `:id`.


## SHA-256 hash algorithm

Every ConsentEvent carries a tamper-evident hash. The service computes it — the repository only stores what it receives.

Hash input (deterministic JSON.stringify of this object, in this field order):
```
{
  consentId:       string,
  dataPrincipalId: string,
  eventType:       'GRANTED' | 'WITHDRAWN',
  purposes:        Json  (same value written to the event),
  noticeVersionId: string,
  timestamp:       ISO 8601 string (toISOString())
}
```

To verify a hash independently:
```js
import { createHash } from 'crypto'
const hash = createHash('sha256').update(JSON.stringify(payload)).digest('hex')
```


## Error codes thrown by service.js

| Code                  | Status | Meaning                                      |
|-----------------------|--------|----------------------------------------------|
| INVALID_PURPOSE       | 422    | One or more purpose IDs not found or inactive |
| CONSENT_NOT_FOUND     | 404    | No ConsentMaster record for the given ID      |
| CONSENT_NOT_ACTIVE    | 409    | Consent exists but status is not ACTIVE        |


## actorType resolution (service.js)

| JWT role                          | ConsentEvent.actorType |
|-----------------------------------|------------------------|
| USER                              | USER                   |
| SYSTEM                            | SYSTEM                 |
| DPO_ADMIN, DPO_OPS, AUDITOR, other | ADMIN                 |


## Read-trail audit actions

The project-level rule in the root `CLAUDE.md` says "every POST/PATCH/DELETE must write to AuditLog". Sujaa's read endpoints **deliberately extend this** and also write AuditLog rows, because viewing a regulatory-proof chain is itself a DPDPA-relevant action that should be auditable.

| Endpoint                       | AuditLog action       |
|--------------------------------|-----------------------|
| GET /consent/:id               | `consent.view`        |
| GET /consent/proof/:consentId  | `consent.proof.view`  |

This is the only deviation from the "mutations only" rule in this module. Ramya's `capture` and `withdraw` continue to write `consent.capture` and `consent.withdraw` as before.


## Import paths from this module

```js
// From within this module
import * as repo    from './repository.js'
import * as service from './service.js'
import { captureConsentSchema } from './validation.js'

// Middleware (used in router.js)
import auth from '../../middleware/auth.js'
import rbac from '../../middleware/rbac.js'

// Prisma singleton (used in repository.js only)
import prisma from '../../lib/prisma.js'
```


## DO NOT

- Modify schema.prisma
- Call `update` or `delete` on ConsentEvent — it is an immutable ledger
- Delete ConsentMaster records — only update status to WITHDRAWN
- Compute the SHA-256 hash inside repository.js — hash belongs in service.js
- Import from @prisma/client directly — always use lib/prisma.js
- Skip writing AuditLog on any mutation
