/******************************************************************************
 * Service layer for Purchase Orders                                          *
 * Keeps Prisma calls in one module so routes stay thin and unit-testable.    *
 ******************************************************************************/

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/* ── CREATE ──────────────────────────────────────────────────────────────── */
exports.create = (body) =>
  prisma.purchaseOrder.create({
    data: {
      ...body,
      // ensure DateTime : if frontend sends 'YYYY-MM-DD'
      expectedDate: new Date(body.expectedDate + 'T00:00:00Z'),
    },
    include: { vendor: true },
  })

/* ── READ list ───────────────────────────────────────────────────────────── */
exports.list = () =>
  prisma.purchaseOrder.findMany({ include: { vendor: true } })

/* ── UPDATE ──────────────────────────────────────────────────────────────── */
exports.update = (id, body) =>
  prisma.purchaseOrder.update({
    where: { id },
    data:  {
      ...body,
      // if expectedDate is present, convert yyyy-mm-dd → ISO
      ...(body.expectedDate
        ? { expectedDate: new Date(body.expectedDate + 'T00:00:00Z') }
        : {}),
    },
    include: { vendor: true },
  })

/* ── DELETE ──────────────────────────────────────────────────────────────── */
exports.remove = (id) =>
  prisma.purchaseOrder.delete({ where: { id } })
