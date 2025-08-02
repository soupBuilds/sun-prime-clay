/******************************************************************************
 *  Sun-Prime Clay – Backend entry (Express + Prisma)                          *
 *  Purpose: start HTTP server, connect Prisma, expose a health endpoint.      *
 ******************************************************************************/

require('dotenv').config()
const express          = require('express')
const cookieParser     = require('cookie-parser')
const { PrismaClient } = require('@prisma/client')

/* ── Instantiate ──────────────────────────────────────────────────────────── */
const prisma = new PrismaClient()
const app    = express()
const port   = process.env.PORT || 4000

/* ── Global middleware ────────────────────────────────────────────────────── */
app.use(express.json())   // parse JSON bodies
app.use(cookieParser())   // read cookies for auth

/* ── Health/hello route (compile-check) ───────────────────────────────────── */
app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from Sun Prime Clay API!' })
})

/* ── Authentication/ auth route ───────────────────────────────────────────── */
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

/* ── Purchase Order/ po route ─────────────────────────────────────────────── */
const poRoutes = require('./routes/po')
app.use('/api/po', poRoutes)

/* ── Vendor/ vendor route ─────────────────────────────────────────────────── */
const vendorRoutes = require('./routes/vendor')
app.use('/api/vendor', vendorRoutes)

/* ── Graceful shutdown ────────────────────────────────────────────────────── */
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

/* ── Start server ─────────────────────────────────────────────────────────── */
app.listen(port, () =>
  console.log(`🚀  Backend listening on http://localhost:${port}`)
)

