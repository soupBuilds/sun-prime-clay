/******************************************************************************
 * Vendor routes                                                              *
 * Anyone authenticated can read; only ADMIN can create/update/delete.        *
 ******************************************************************************/

const router        = require('express').Router()
const ah            = require('express-async-handler')
const { PrismaClient } = require('@prisma/client')
const prisma        = new PrismaClient()

const requireAuth   = require('../middleware/requireAuth')
const requireAdmin  = require('../middleware/requireRole')('ADMIN')

/* ── READ list ───────────────────────────────────────────────────────────── */
router.get('/', requireAuth, ah(async (_req, res) => {
  res.json(await prisma.vendor.findMany())
}))

/* ── CREATE ──────────────────────────────────────────────────────────────── */
router.post('/', requireAdmin, ah(async (req, res) => {
  const { name, contact } = req.body
  if (!name) return res.status(400).json({ msg: 'Name required' })
  const created = await prisma.vendor.create({ data: { name, contact } })
  res.status(201).json(created)
}))

/* ── UPDATE ──────────────────────────────────────────────────────────────── */
router.put('/:id', requireAdmin, ah(async (req, res) => {
  const updated = await prisma.vendor.update({
    where: { id: Number(req.params.id) },
    data:  req.body,
  })
  res.json(updated)
}))

/* ── DELETE ──────────────────────────────────────────────────────────────── */
router.delete('/:id', requireAdmin, ah(async (req, res) => {
  await prisma.vendor.delete({ where: { id: Number(req.params.id) } })
  res.sendStatus(204)
}))

module.exports = router
