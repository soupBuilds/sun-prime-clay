/******************************************************************************
 * Purchase-Order routes (CRUD)                                               *
 * Guarded so only PROCUREMENT users can create / edit / delete.              *
 ******************************************************************************/

const router        = require('express').Router()
const ah            = require('express-async-handler')
const poService     = require('../services/po.service')
const requireRole   = require('../middleware/requireRole')('PROCUREMENT') // also checks JWT

/* ── apply role guard to every sub-route ─────────────────────────────────── */
router.use(requireRole)

/* ── GET /api/po – list all purchase orders ─────────────────────────────── */
router.get('/', ah(async (_req, res) => {
  res.json(await poService.list())
}))

/* ── POST /api/po – create new PO ───────────────────────────────────────── */
router.post('/', ah(async (req, res) => {
  const created = await poService.create(req.body)
  res.status(201).json(created)
}))

/* ── PUT /api/po/:id – update existing PO ───────────────────────────────── */
router.put('/:id', ah(async (req, res) => {
  const updated = await poService.update(Number(req.params.id), req.body)
  res.json(updated)
}))

/* ── DELETE /api/po/:id – cancel / remove PO ────────────────────────────── */
router.delete('/:id', ah(async (req, res) => {
  await poService.remove(Number(req.params.id))
  res.sendStatus(204)
}))

module.exports = router
