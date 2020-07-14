
// const _ = require('lodash')
const cron = require(`node-cron`)
const substruct = require(`@internalfx/substruct`)

module.exports = async function (config) {
  const garbageCollector = substruct.services.garbageCollector
  const operationManager = substruct.services.operationManager
  const scheduleManager = substruct.services.scheduleManager

  let gcReady = true
  let omReady = true
  let smReady = true

  let schedules = {
    garbageCollector: `0 */10 * * * *`,
    operationManager: `* * * * * *`,
    scheduleManager: `* * * * * *`
  }

  if (config.isDevelopment) {
    schedules = {
      garbageCollector: `0 * * * * *`,
      operationManager: `*/5 * * * * *`,
      scheduleManager: `* * * * * *`
    }
  }

  const garbageCollectorTask = cron.schedule(schedules.garbageCollector, async function () {
    try {
      if (gcReady) {
        console.log(`CRON - garbageCollectorTask`)
        gcReady = false
        await garbageCollector.run()
      }
    } catch (err) {
      console.log(err)
    }
    gcReady = true
  })

  const operationManagerTask = cron.schedule(schedules.operationManager, async function () {
    try {
      if (omReady) {
        // console.log('CRON - operationManagerTask')
        omReady = false
        await operationManager.run()
      }
    } catch (err) {
      console.log(err)
    }
    omReady = true
  })

  const scheduleManagerTask = cron.schedule(schedules.scheduleManager, async function () {
    try {
      if (smReady) {
        // console.log('CRON - scheduleManagerTask')
        smReady = false
        await scheduleManager.run()
      }
    } catch (err) {
      console.log(err)
    }
    smReady = true
  })

  return {
    garbageCollectorTask,
    operationManagerTask,
    scheduleManagerTask
  }
}
