const router          = require('express').Router()
const ah              = require('express-async-handler')
const { PrismaClient }= require('@prisma/client')
const prisma          = new PrismaClient()
const requireAuth     = require('../middleware/requireAuth')        // just validates token
const requireAdmin    = require('../middleware/requireRole')('ADMIN')

/* ─── READ: available to every authenticated user ─── */
router.get('/', requireAuth, ah(async (_, res) => {
  res.json(await prisma.vendor.findMany())
}))

/* ─── WRITE: admin-only operations ─── */
router.post('/',    requireAdmin, ah(async (req, res) => {
  const { name, contact } = req.body
  if (!name) return res.status(400).json({ msg: 'Name required' })
  res.status(201).json(await prisma.vendor.create({ data: { name, contact } }))
}))

router.put('/:id',  requireAdmin, ah(async (req, res) => {
  res.json(await prisma.vendor.update({
    where: { id: Number(req.params.id) },
    data:  req.body,
  }))
}))

router.delete('/:id', requireAdmin, ah(async (req, res) => {
  await prisma.vendor.delete({ where: { id: Number(req.params.id) } })
  res.sendStatus(204)
}))

module.exports = router
