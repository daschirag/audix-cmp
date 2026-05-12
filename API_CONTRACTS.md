# API Contracts — CMP Backend

> This file is the single source of truth for all API endpoints.
> Frontend interns (Tanusha + Elakiya) paste this into Gemini at the
> start of every session. Backend interns follow these exact shapes.

## Base URL
- Development: http://localhost:3001
- Frontend proxy: http://localhost:3000/api/*

## Standard Response Format (every endpoint returns this)
{
  "success": true | false,
  "message": "Human readable string",
  "data":    any | null
}

## Error Response Format
{
  "success": false,
  "message": "Human readable error",
  "code":    "SCREAMING_SNAKE_CASE"
}

---

## AUTH ENDPOINTS

### POST /auth/register
Creates a new user account.

Request body:
{
  "email":      "user@example.com",   // required
  "password":   "min8chars",          // required, min 8 chars
  "mobile":     "9876543210",         // optional
  "role":       "USER",               // optional, default USER
  "isMinor":    false,                // optional, default false
  "guardianId": null                  // optional, required if isMinor=true
}

Success response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id":    "mongodb-object-id",
    "email": "user@example.com",
    "role":  "USER"
  }
}

Error codes:
- 400 VALIDATION_ERROR  → missing/invalid fields
- 409 EMAIL_EXISTS      → email already registered

---

### POST /auth/login
Logs in and returns JWT access token.

Request body:
{
  "email":    "user@example.com",
  "password": "yourpassword"
}

Success response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken":  "eyJhbGci...",
    "refreshToken": "uuid-v4-string",
    "user": {
      "id":    "mongodb-object-id",
      "email": "user@example.com",
      "role":  "DPO_ADMIN"
    }
  }
}

Error codes:
- 400 VALIDATION_ERROR      → missing fields
- 401 INVALID_CREDENTIALS   → wrong email or password

Frontend usage:
- Store accessToken in React state (NOT localStorage)
- Send as: Authorization: Bearer <accessToken>
- Store refreshToken in memory for refresh calls

---

### POST /auth/refresh
Issues new access token using refresh token.

Request body:
{
  "refreshToken": "uuid-v4-string"
}

Success response (200):
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken":  "eyJhbGci...",
    "refreshToken": "new-uuid-v4"
  }
}

Error codes:
- 401 INVALID_REFRESH_TOKEN → token not found or expired

---

### POST /auth/logout
Logs out and blacklists the current token.

Headers: Authorization: Bearer <accessToken>

Request body:
{
  "refreshToken": "uuid-v4-string"
}

Success response (200):
{
  "success": true,
  "message": "Logged out successfully",
  "data":    null
}

---

## CONSENT ENDPOINTS

### POST /consent/capture
Captures user consent for one or more purposes.

Headers: Authorization: Bearer <accessToken>

Request body:
{
  "dataPrincipalId": "mongodb-user-id",   // required
  "purposes": [                            // required, min 1 item
    {
      "purposeId": "mongodb-purpose-id",
      "granted":   true
    }
  ],
  "noticeVersionId": "mongodb-notice-id", // required
  "language":        "en",                // required: en | hi | ta
  "source":          "web"                // required: web | mobile
}

Success response (201):
{
  "success": true,
  "message": "Consent captured successfully",
  "data": {
    "consentId": "mongodb-object-id",
    "status":    "ACTIVE"
  }
}

Error codes:
- 400 VALIDATION_ERROR    → missing/invalid fields
- 404 PURPOSE_NOT_FOUND   → purposeId does not exist in PurposeCatalog
- 404 NOTICE_NOT_FOUND    → noticeVersionId does not exist
- 409 DUPLICATE_CONSENT   → consent already exists for this principal+purpose

---

### GET /consent/:id
Returns full consent record with all events.

Headers: Authorization: Bearer <accessToken>

Success response (200):
{
  "success": true,
  "message": "Consent fetched",
  "data": {
    "id":              "mongodb-object-id",
    "dataPrincipalId": "mongodb-user-id",
    "purposes":        [...],
    "status":          "ACTIVE",
    "createdAt":       "ISO-date",
    "expiresAt":       "ISO-date",
    "events":          [...]
  }
}

Error codes:
- 404 CONSENT_NOT_FOUND → no consent with that id

---

### GET /consent/status/:principalId
Returns current consent status per purpose for a user.

Headers: Authorization: Bearer <accessToken>

Success response (200):
{
  "success": true,
  "message": "Status fetched",
  "data": [
    {
      "purposeId": "mongodb-id",
      "purpose":   "Marketing",
      "status":    "ACTIVE"
    }
  ]
}

---

### DELETE /consent/:id/withdraw
Withdraws an active consent.

Headers: Authorization: Bearer <accessToken>

Success response (200):
{
  "success": true,
  "message": "Consent withdrawn successfully",
  "data": {
    "consentId": "mongodb-object-id",
    "status":    "WITHDRAWN"
  }
}

Error codes:
- 404 CONSENT_NOT_FOUND   → no consent with that id
- 409 ALREADY_WITHDRAWN   → consent already withdrawn

---

### GET /consent/proof/:consentId
Returns full consent chain for regulatory proof.

Headers: Authorization: Bearer <accessToken>

Success response (200):
{
  "success": true,
  "message": "Proof fetched",
  "data": {
    "consent":       { ...full ConsentMaster record },
    "events":        [ ...all ConsentEvents in order ],
    "noticeVersion": { ...linked NoticeVersion }
  }
}

---

## COMPLAINTS ENDPOINTS

### POST /complaints
Files a new complaint.

Headers: Authorization: Bearer <accessToken>

Request body:
{
  "dataPrincipalId": "mongodb-user-id",   // required
  "consentId":       "mongodb-id",        // optional
  "subject":         "string",            // required
  "description":     "string"             // required
}

Success response (201):
{
  "success": true,
  "message": "Complaint filed successfully",
  "data": {
    "complaintId": "mongodb-object-id",
    "status":      "RECEIVED"
  }
}

---

### GET /complaints/:id
Returns full complaint record.

Headers: Authorization: Bearer <accessToken>

Success response (200):
{
  "success": true,
  "message": "Complaint fetched",
  "data": { ...full Complaint record }
}

---

### GET /complaints
Returns list of complaints with optional filter.

Headers: Authorization: Bearer <accessToken>
Query params: ?status=RECEIVED | UNDER_REVIEW | ESCALATED | CLOSED

Success response (200):
{
  "success": true,
  "message": "Complaints fetched",
  "data": [ ...array of Complaint records ]
}

---

### PATCH /complaints/:id/status
Updates complaint status — enforces state machine.

Headers: Authorization: Bearer <accessToken>

Request body:
{
  "status": "UNDER_REVIEW"
}

Valid transitions ONLY:
RECEIVED → UNDER_REVIEW
UNDER_REVIEW → ESCALATED
UNDER_REVIEW → CLOSED
ESCALATED → CLOSED

Any other transition returns 422.

Success response (200):
{
  "success": true,
  "message": "Status updated",
  "data": {
    "complaintId": "mongodb-object-id",
    "status":      "UNDER_REVIEW"
  }
}

Error codes:
- 422 INVALID_TRANSITION → that status change is not allowed

---

### PATCH /complaints/:id/assign
Assigns a complaint to an officer.

Headers: Authorization: Bearer <accessToken>

Request body:
{
  "assignedTo": "mongodb-user-id"
}

Success response (200):
{
  "success": true,
  "message": "Complaint assigned",
  "data": {
    "complaintId": "mongodb-object-id",
    "assignedTo":  "mongodb-user-id"
  }
}

---

## DASHBOARD ENDPOINTS

### GET /dashboard/summary
Returns stat card counts for DPO dashboard.

Headers: Authorization: Bearer <accessToken>

Success response (200):
{
  "success": true,
  "message": "Summary fetched",
  "data": {
    "active":         42,
    "withdrawn":      8,
    "expired":        3,
    "openComplaints": 5
  }
}

---

## HEALTH ENDPOINTS

### GET /health
Liveness check — always 200.

Response (200):
{
  "success": true,
  "message": "Server is running",
  "data": {
    "uptime":      123.45,
    "environment": "development",
    "timestamp":   "ISO-date"
  }
}

---

### GET /ready
Readiness check — confirms DB connected.

Response (200):
{
  "success": true,
  "message": "Server is ready",
  "data": {
    "database":  "connected",
    "timestamp": "ISO-date"
  }
}

Response (503) if DB not connected:
{
  "success": false,
  "message": "Database not ready",
  "code":    "DB_NOT_READY"
}

---

## FRONTEND FETCH PATTERN (Tanusha + Elakiya use this)

// Login and store token
const res = await fetch('/api/auth/login', {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ email, password })
})
const { data } = await res.json()
// store data.accessToken in React state

// Authenticated request
const res = await fetch('/api/consent/capture', {
  method:  'POST',
  headers: {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(payload)
})