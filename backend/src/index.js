/******************************************************************************
 *  Canonical Express entry point — single source of truth for Day-2 backend  *
 ******************************************************************************/
require('dotenv').config()
const express           = require('express')
const { PrismaClient }  = require('@prisma/client')

const prisma = new PrismaClient()
const app    = express()
const port   = process.env.PORT || 4000


/* ---------- global middleware ---------- */
app.use(express.json())                 // automatic JSON body parsing

const cookieParser = require('cookie-parser')
const authRoutes   = require('./routes/auth')

app.use(cookieParser())           // after express.json()
app.use('/api/auth', authRoutes)


/* ---------- trivial “alive” check ---------- */
app.get('/api/hello', (_, res) => {
  res.json({ message: 'Hello from Sun Prime Clay API!' })
})

/* ---------- smoke-test Prisma ---------- */
app.get('/api/users', async (_, res, next) => {
  try {
    const users = await prisma.user.findMany({ include: { role: true } })
    res.json(users)                      // should return [] until you add users
  } catch (err) {
    next(err)
  }
})

/* ---------- start server ---------- */
app.listen(port, () => {
  console.log(`🚀  Backend listening at http://localhost:${port}`)
})

/* ---------- graceful shutdown ---------- */
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

const poRoutes = require('./routes/po')
app.use('/api/po', poRoutes)


const vendorRoutes = require('./routes/vendor')
app.use('/api/vendor', vendorRoutes)
