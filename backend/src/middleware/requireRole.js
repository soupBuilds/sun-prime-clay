/**************************************************************************
 * Role-guard middleware                                                  *
 * Usage: app.use('/api/po', requireRole('PROCUREMENT'))                  *
 * Passes the request when…                                               *
 *   1. JWT is valid   (handled by requireAuth)                           *
 *   2. user.role === requiredRole  OR  user.role === 'ADMIN'             *
 **************************************************************************/

const requireAuth = require('./requireAuth')

module.exports = (requiredRole) => [
  requireAuth,                             // verifies JWT & sets req.user
  (req, res, next) => {
    const { role } = req.user              // role was put in JWT payload
    if (role === requiredRole || role === 'ADMIN') return next()
    return res.status(403).json({ msg: 'Forbidden' })
  },
]
