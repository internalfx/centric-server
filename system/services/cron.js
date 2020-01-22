
// const _ = require('lodash')
const cron = require('node-cron')
const substruct = require('@internalfx/substruct')

module.exports = async function (config) {
  const garbageCollector = substruct.services.garbageCollector
  const operationManager = substruct.services.operationManager
  const scheduleManager = substruct.services.scheduleManager

  let schedules = {
    garbageCollector: '0 0 * * * *',
    operationManager: '* * * * * *',
    scheduleManager: '* * * * * *'
  }

  if (config.isDevelopment) {
    schedules = {
      garbageCollector: '0 * * * * *',
      operationManager: '* * * * * *',
      scheduleManager: '* * * * * *'
    }
  }

  const garbageCollectorTask = cron.schedule(schedules.garbageCollector, async function () {
    try {
      console.log('CRON - garbageCollectorTask')

      await garbageCollector.run()
    } catch (err) {
      console.log(err)
    }
  })

  const operationManagerTask = cron.schedule(schedules.operationManager, async function () {
    try {
      // console.log('CRON - operationManagerTask')

      await operationManager.run()
    } catch (err) {
      console.log(err)
    }
  })

  const scheduleManagerTask = cron.schedule(schedules.scheduleManager, async function () {
    try {
      // console.log('CRON - scheduleManagerTask')

      await scheduleManager.run()
    } catch (err) {
      console.log(err)
    }
  })

  return {
    garbageCollectorTask,
    operationManagerTask,
    scheduleManagerTask
  }
}
