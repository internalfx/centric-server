
const cronParser = require('cron-parser')
const _ = require('lodash')

module.exports = async function (config) {
  const substruct = require('@internalfx/substruct')
  const { arango, aql, getNumber } = substruct.services.arango
  const taskFiles = substruct.services.taskFiles
  const { createOp } = substruct.services.operationManager
  const runTimes = {}

  const run = async function () {
    try {
      await checkSchedules()
    } catch (err) {
      console.log(err)
    }
  }

  const checkSchedules = async function () {
    const schedules = await arango.qAll(aql`
      FOR s IN schedules
        RETURN MERGE(s, { task: DOCUMENT('tasks', s.taskKey) })
    `)

    for (const schedule of schedules) {
      const interval = cronParser.parseExpression(schedule.cronTime)
      const nextRun = interval.next().toDate()

      let enabled = schedule.enabled

      if (schedule.task == null) {
        continue
      }

      if (schedule.task.enabled !== true) {
        enabled = false
      }

      if (schedule.task.valid !== true) {
        enabled = false
      }

      const runTime = runTimes[schedule._key]

      if (runTime != null && enabled !== true) {
        console.log(`=== ${schedule.task.name} === Remove runTime`)
        delete runTimes[schedule._key]
      } else if (runTime == null && enabled === true) {
        console.log(`=== ${schedule.task.name} === Create runTime`)
        runTimes[schedule._key] = nextRun.getTime()
      } else if (runTime != null && enabled === true && runTime <= Date.now()) {
        console.log(`=== ${schedule.task.name} === Run Now!`)
        await createScheduledOp(schedule._key)
        runTimes[schedule._key] = nextRun.getTime()
      } else if (runTime != null && enabled === true && runTime !== nextRun.getTime()) {
        console.log(`=== ${schedule.task.name} === Reset runTime`)
        runTimes[schedule._key] = nextRun.getTime()
      }
    }
  }

  const createScheduledOp = async function (scheduleKey) {
    const schedule = await arango.qNext(aql`RETURN DOCUMENT('schedules', ${scheduleKey})`)
    if (schedule == null) {
      console.log(`Schedule ${scheduleKey} removed`)
    }

    try {
      return createOp(schedule)
    } catch (err) {
      console.log(err)
    }
  }

  return Object.freeze({
    createScheduledOp,
    run
  })
}
