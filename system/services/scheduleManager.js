
const cronParser = require('cron-parser')
const _ = require('lodash')

module.exports = async function (config) {
  const substruct = require('@internalfx/substruct')
  const { arango, aql, getNumber } = substruct.services.arango
  const taskFiles = substruct.services.taskFiles
  const runTimes = {}

  const supervisorRun = async function () {
    try {
      await checkSchedules()
    } catch (err) {
      console.log(err)
    }

    setTimeout(supervisorRun, 900)
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

  supervisorRun()

  const createScheduledOp = async function (scheduleKey) {
    const schedule = await arango.qNext(aql`RETURN DOCUMENT('schedules', ${scheduleKey})`)
    if (schedule == null) {
      console.log(`Schedule ${scheduleKey} removed`)
    }

    try {
      const task = await arango.qNext(aql`RETURN DOCUMENT('tasks', ${schedule.taskKey})`)
      const taskFile = taskFiles[task.name]

      console.log(`${new Date()} - Creating new operation for task "${task.name}"`)

      const locks = (function () {
        if (_.isFunction(taskFile.locks)) {
          return taskFile.locks({
            opData: schedule.data,
            taskData: task.data
          })
        } else if (_.isString(taskFile.locks)) {
          return [taskFile.locks]
        } else if (_.isArray(taskFile.locks)) {
          return taskFile.locks
        } else {
          return null
        }
      }.call())

      let operation = {
        number: (await getNumber('operation')),
        sourceId: schedule._id,
        taskKey: task._key,
        status: 'waiting',
        locks: locks,
        data: schedule.data || {},
        runCount: 0,
        nextRunDate: new Date(),
        createdAt: new Date()
      }

      operation = await arango.qNext(aql`
        INSERT ${operation} IN operations RETURN NEW
      `)

      return operation
    } catch (err) {
      console.log(err)
    }
  }

  return Object.freeze({
    createScheduledOp
  })
}
