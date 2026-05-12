// Role hierarchy
// DPO_ADMIN   → full access
// DPO_OPS     → read + write consents + complaints
// AUDITOR     → read only, no writes
// USER        → only their own consent data

const ROLE_PERMISSIONS = {
  DPO_ADMIN: [
    'consent:read',
    'consent:write',
    'consent:delete',
    'complaints:read',
    'complaints:write',
    'dashboard:read',
    'users:read',
    'users:write',
    'audit:read',
  ],
  DPO_OPS: [
    'consent:read',
    'consent:write',
    'complaints:read',
    'complaints:write',
    'dashboard:read',
  ],
  AUDITOR: [
    'consent:read',
    'complaints:read',
    'dashboard:read',
    'audit:read',
  ],
  USER: [
    'consent:read',
    'consent:write',
  ],
}

// Usage: router.get('/route', auth, rbac('consent:read'), handler)
const rbac = (requiredPermission) => {
  return (req, res, next) => {
    // auth middleware must run first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        code: 'NOT_AUTHENTICATED'
      })
    }

    const { role } = req.user
    const permissions = ROLE_PERMISSIONS[role] || []

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: `Role ${role} does not have permission: ${requiredPermission}`,
        code: 'FORBIDDEN'
      })
    }

    // attach resolved permissions to request
    req.user.permissions = permissions
    next()
  }
}

export { ROLE_PERMISSIONS }
export default rbac