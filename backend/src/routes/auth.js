const router            = require('express').Router()
const asyncHandler      = require('express-async-handler')
const { PrismaClient }  = require('@prisma/client')
const prisma            = new PrismaClient()
const auth              = require('../utils/auth')

/* ----- POST /api/auth/register ----- */
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ msg: 'Missing fields' })

  const exists = await prisma.user.findUnique({
    where: { email },
    include:{ role:true } 
  })
  if (exists) return res.status(409).json({ msg: 'Email already registered' })

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await auth.hash(password),
      role: { connect: { name: 'PROCUREMENT' } },     // default role
    },
    select: { id: true, email: true, name: true, role: true },
  })

  const tokens = auth.signTokens({
     uid: user.id,
     role: user.role?.name 
    })
  res
    .cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*24*7 })
    .json({ accessToken: tokens.accessToken, user })
}))

/* ----- POST /api/auth/login ----- */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({
     where: { email },
     include:{ role:true } 
    })
  if (!user || !(await auth.verify(password, user.passwordHash)))
    return res.status(401).json({ msg: 'Invalid credentials' })

  const tokens = auth.signTokens({
    uid: user.id,
    role: user.role?.name
  })
  res
    .cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*24*7 })
    .json({ accessToken: tokens.accessToken })
}))

/* ----- POST /api/auth/refresh ----- */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies
  if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' })

  const payload = auth.verifyRefresh(refreshToken)
  const tokens  = auth.signTokens({ uid: payload.uid, role: payload.role })
  res
    .cookie('refreshToken', tokens.refreshToken, { httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*24*7 })
    .json({ accessToken: tokens.accessToken })
}))

module.exports = router
