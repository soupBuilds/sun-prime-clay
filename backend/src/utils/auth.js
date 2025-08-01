const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const ACCESS_TTL  = '15m'
const REFRESH_TTL = '7d'

exports.hash = async (plain) => bcrypt.hash(plain, 12)
exports.verify = (plain, hash) => bcrypt.compare(plain, hash)

exports.signTokens = (payload) => ({
  accessToken:  jwt.sign(payload,  process.env.JWT_ACCESS_SECRET,  { expiresIn: ACCESS_TTL  }),
  refreshToken: jwt.sign(payload,  process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL }),
})

exports.verifyAccess  = (token) => jwt.verify(token,  process.env.JWT_ACCESS_SECRET)
exports.verifyRefresh = (token) => jwt.verify(token,  process.env.JWT_REFRESH_SECRET)
