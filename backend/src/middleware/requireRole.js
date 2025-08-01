const requireAuth = require('./requireAuth')

module.exports = (role) => [
  requireAuth,                                        // ensures token is valid
  (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ msg: 'Forbidden' })
    next()
  },
]