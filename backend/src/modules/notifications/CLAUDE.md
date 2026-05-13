\# Notifications Module — CLAUDE.md

Created by Hamsavardhan M | May 13, 2026



\## What exists in this module



\### notification.service.js

\- sendConsentGranted(userId) → Notification document

\- sendConsentWithdrawn(userId) → Notification document



\## What each function does



sendConsentGranted(userId):

&#x20; 1. Logs to console: NOTIFICATION: Consent granted for user {userId}

&#x20; 2. Writes Notification to MongoDB with:

&#x20;    type: 'CONSENT\_GRANTED'

&#x20;    message: 'Your consent has been recorded successfully.'

&#x20;    status: 'SENT'

&#x20; 3. Returns the created Notification document



sendConsentWithdrawn(userId):

&#x20; 1. Logs to console: NOTIFICATION: Consent withdrawn for user {userId}

&#x20; 2. Writes Notification to MongoDB with:

&#x20;    type: 'CONSENT\_WITHDRAWN'

&#x20;    message: 'Your consent has been withdrawn successfully.'

&#x20;    status: 'SENT'

&#x20; 3. Returns the created Notification document



\## Prisma model used

Notification: {

&#x20; id:        String (ObjectId)

&#x20; userId:    String (ObjectId) — FK to User

&#x20; type:      String — CONSENT\_GRANTED | CONSENT\_WITHDRAWN

&#x20; message:   String

&#x20; status:    String — SENT | FAILED

&#x20; createdAt: DateTime

}



\## How Ramya uses this in consent module

After successful POST /consent/capture — call:



import notificationService from '../notifications/notification.service.js'

await notificationService.sendConsentGranted(dataPrincipalId)



After successful DELETE /consent/:id/withdraw — call:



import notificationService from '../notifications/notification.service.js'

await notificationService.sendConsentWithdrawn(dataPrincipalId)



\## Import path from consent module

import notificationService from '../notifications/notification.service.js'



\## Import path from complaints module

import notificationService from '../notifications/notification.service.js'



\## DO NOT modify

\- schema.prisma

\- lib/prisma.js

