const router       = require('express').Router()
const ah           = require('express-async-handler')
const poService    = require('../services/po.service')
const requireRole  = require('../middleware/requireRole')('PROCUREMENT')

router.use(requireRole)                     // all routes below require PROCUREMENT

router.get('/', ah(async (_, res) => {
  res.json(await poService.listPO())
}))

router.post('/', ah(async (req, res) => {
  res.status(201).json(await poService.createPO(req.body))
}))

router.put('/:id', ah(async (req, res) => {
  res.json(await poService.updatePO(Number(req.params.id), req.body))
}))

router.delete('/:id', ah(async (req, res) => {
  await poService.deletePO(Number(req.params.id))
  res.sendStatus(204)
}))

module.exports = router
