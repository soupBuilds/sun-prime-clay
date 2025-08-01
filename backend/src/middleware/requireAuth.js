const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ msg: 'No token' })

  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    next()
  } catch {
    res.status(401).json({ msg: 'Token invalid/expired' })
  }
}
