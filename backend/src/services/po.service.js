const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.createPO = (data) => {
  return prisma.purchaseOrder.create({
    data: {
      ...data,
      // ensure Postgres gets a full timestamp, not a bare string
      expectedDate: new Date(data.expectedDate + 'T00:00:00Z'),
    },
  })
}

exports.listPO   = ()      => prisma.purchaseOrder.findMany({ include:{vendor:true} })
exports.updatePO = (id, d) => prisma.purchaseOrder.update({ where:{id}, data:d })
exports.deletePO = (id)    => prisma.purchaseOrder.delete({ where:{id} })
