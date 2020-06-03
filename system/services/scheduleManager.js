
const cronParser = require(`cron-parser`)
// const _ = require(`lodash`)

module.exports = async function (config) {
  const substruct = require(`@internalfx/substruct`)
  const { arango, aql } = substruct.services.arango
  // const taskFiles = substruct.services.taskFiles
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
    try {
      const schedule = await arango.qNext(aql`RETURN DOCUMENT('schedules', ${scheduleKey})`)
      if (schedule == null) {
        console.log(`Schedule ${scheduleKey} removed`)
      }

      if (!schedule.allowMultiple) {
        const operations = await arango.qAll(aql`
          FOR op IN operations
            FILTER op.taskKey == ${schedule.taskKey} AND op.status IN ['waiting', 'failed', 'active']
            RETURN op
        `)

        if (operations.length > 0) {
          return
        }
      }

      const task = await arango.qNext(aql`RETURN DOCUMENT(tasks, ${schedule.taskKey})`)
      return createOp(task.name, schedule.data, schedule._id)
    } catch (err) {
      console.log(err)
    }
  }

  return Object.freeze({
    createScheduledOp,
    run
  })
}
