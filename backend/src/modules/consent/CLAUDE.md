# Consent Module — CLAUDE.md

Created by Ramya | Last updated: May 13, 2026


## Owners

- Ramya — POST /consent/capture, DELETE /consent/:id/withdraw, GET /consent/status/:principalId
- Sujaa — GET /consent/:id, GET /consent/proof/:consentId (routes stubbed in router.js, handlers not yet written)


## What exists in this module


### repository.js

- `createConsent(data)` → ConsentMaster
- `createConsentEvent(data)` → ConsentEvent — append-only, never update or delete this model
- `getConsentByPrincipalId(principalId)` → ConsentMaster[] ordered by createdAt desc
- `withdrawConsent(id)` → ConsentMaster — updates status field ONLY, never deletes
- `findConsentById(id)` → ConsentMaster | null
- `findActivePurposesByIds(ids)` → PurposeCatalog[] — returns only records where isActive: true
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

actor shape: `{ id: string, role: string, ip: string }` — assembled by the controller from req.user + req.ip


### controller.js

- `capture(req, res)` — POST /consent/capture — Zod-validates body, calls service.captureConsent, 201 on success
- `withdraw(req, res)` — DELETE /consent/:id/withdraw — extracts req.params.id, calls service.withdrawConsent, 200 on success
- `getStatus(req, res)` — GET /consent/status/:principalId — extracts req.params.principalId, calls service.getConsentStatus, 200 on success

Zod errors are formatted as `"field.path: message; field.path: message"` with code VALIDATION_ERROR.


### validation.js

- `captureConsentSchema` — Zod schema for POST /consent/capture body
  - `dataPrincipalId`: string, required
  - `purposes`: array of objects, each must have `id: string`; extra fields pass through; min 1 item
  - `language`: string, required
  - `noticeVersionId`: string, required
  - `source`: object, extra fields pass through
  - `expiresAt`: ISO 8601 datetime string with timezone offset, optional


### router.js — All routes (Ramya's)

- POST   /consent/capture            — auth + rbac('consent:write')
- DELETE /consent/:id/withdraw       — auth + rbac('consent:write')
- GET    /consent/status/:principalId — auth + rbac('consent:read')

Note: DELETE uses consent:write (not consent:delete) so that USER role can withdraw their own consent.
Sujaa's two routes are commented out at the bottom of router.js.


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


## What Sujaa needs to add

1. In `controller.js` — add handlers: `getById(req, res)` and `getProof(req, res)`
2. In `router.js` — uncomment and wire up the two stubbed routes at the bottom
3. Both routes need `repo.findConsentById` which already exists in repository.js
4. For proof endpoint, include events via Prisma `include: { events: true }` — add a new repo function if needed


## Import paths from this module

```js
// From within this module
import * as repo    from './repository.js'
import * as service from './service.js'
import { captureConsentSchema } from './validation.js'

// Middleware (used in router.js)
import auth from '../../../middleware/auth.js'
import rbac from '../../../middleware/rbac.js'

// Prisma singleton (used in repository.js only)
import prisma from '../../../lib/prisma.js'
```


## DO NOT

- Modify schema.prisma
- Call `update` or `delete` on ConsentEvent — it is an immutable ledger
- Delete ConsentMaster records — only update status to WITHDRAWN
- Compute the SHA-256 hash inside repository.js — hash belongs in service.js
- Import from @prisma/client directly — always use lib/prisma.js
- Skip writing AuditLog on any mutation
