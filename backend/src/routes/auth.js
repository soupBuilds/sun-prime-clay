/******************************************************************************
 *  Auth routes – register, login, refresh                                     *
 *  Dependencies: bcryptjs, jsonwebtoken, express-async-handler                *
 ******************************************************************************/

const router           = require('express').Router()
const ah               = require('express-async-handler')   // error wrapper
const bcrypt           = require('bcryptjs')
const jwt              = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma           = new PrismaClient()

/* ── helpers ──────────────────────────────────────────────────────────────── */
const ACCESS_TTL  = '15m'
const REFRESH_TTL = '7d'

const signTokens = (payload) => ({
  accessToken:  jwt.sign(payload, process.env.JWT_ACCESS_SECRET,  { expiresIn: ACCESS_TTL  }),
  refreshToken: jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL }),
})

/* ── POST /api/auth/register ─────────────────────────────────────────────── */
router.post('/register', ah(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' })

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ msg: 'Email already registered' })

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: { connect: { name: 'PROCUREMENT' } },   // default role
    },
    include: { role: true },
  })

  const tokens = signTokens({ uid: user.id, role: user.role.name })
  res
    .cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*24*7 })
    .json({ accessToken: tokens.accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role.name } })
}))

/* ── POST /api/auth/login ────────────────────────────────────────────────── */
router.post('/login', ah(async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } })
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ msg: 'Invalid credentials' })

  const tokens = signTokens({ uid: user.id, role: user.role.name })
  res
    .cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*24*7 })
    .json({ accessToken: tokens.accessToken })
}))

/* ── POST /api/auth/refresh ──────────────────────────────────────────────── */
router.post('/refresh', ah(async (req, res) => {
  const { refreshToken } = req.cookies
  if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' })

  let payload
  try { payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) }
  catch { return res.status(401).json({ msg: 'Token invalid/expired' }) }

  const tokens = signTokens({ uid: payload.uid, role: payload.role })
  res
    .cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*24*7 })
    .json({ accessToken: tokens.accessToken })
}))

module.exports = router
