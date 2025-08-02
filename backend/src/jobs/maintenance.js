const { Queue, Worker } = require('bullmq')
const Redis             = { connection: { host: 'localhost', port: 6379 } }
const queue             = new Queue('maintenance', Redis)
module.exports.queue    = queue

// Repeatable nightly scan → flags overdue tasks
new Worker('maintenance', async () => {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  const today  = new Date()

  const due = await prisma.maintenanceTask.findMany({
    where: { nextDueOn: { lte: today } },
  })

  await Promise.all(due.map(t =>
    prisma.maintenanceTask.update({
      where: { id: t.id },
      data:  { status: 'OVERDUE' },
    })
  ))
}, Redis)

// schedule once
queue.add('daily-scan', {}, { repeat: { cron: '0 2 * * *' } })