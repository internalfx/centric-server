
const MAX_BATCH_SIZE = 20
// let BATCH_CONCURRENCY = 5
const ERROR_STRING = `---logError---`

const Promise = require(`bluebird`)
const moment = require(`moment`)
// let cronParser = require('cron-parser')
const _ = require(`lodash`)

const { spiderData } = require(`../../lib/utils.js`)

module.exports = async function (config) {
  const substruct = require(`@internalfx/substruct`)
  const { arango, aql, getNumber } = substruct.services.arango
  const taskFiles = substruct.services.taskFiles

  let firstRun = true

  const createOpFunctions = function (operation) {
    if (!operation) {
      throw new Error(`operation required`)
    }

    const saveOpData = async function (data) {
      return arango.qNext(aql`
        UPDATE ${operation._key} WITH { data: ${data} } IN operations OPTIONS { mergeObjects: false } RETURN NEW.data
      `)
    }

    const saveTaskData = async function (data) {
      return arango.qNext(aql`
        UPDATE ${operation.taskKey} WITH { data: ${data} } IN tasks OPTIONS { mergeObjects: false } RETURN NEW.data
      `)
    }

    const log = async function (type, message, data = null, group = null) {
      data = JSON.decycle(data)

      const entry = {
        number: (await getNumber(`entry`)),
        createdAt: new Date(),
        operationKey: operation._key,
        type: type,
        groupName: group,
        message: message,
        data: data,
        index: spiderData([message, group, data])
      }

      return arango.q(aql`
        INSERT ${entry} IN entries
      `)
    }

    const logInfo = async function (message, data = null, group = null) {
      data = JSON.decycle(data)

      const entry = {
        number: (await getNumber(`entry`)),
        createdAt: new Date(),
        operationKey: operation._key,
        type: `info`,
        groupName: group,
        message: message,
        data: data,
        index: spiderData([message, group, data])
      }

      return arango.q(aql`
        INSERT ${entry} IN entries
      `)
    }

    const logWarning = async function (message, data = null, group = null) {
      data = JSON.decycle(data)

      const entry = {
        number: (await getNumber(`entry`)),
        createdAt: new Date(),
        operationKey: operation._key,
        type: `warning`,
        groupName: group,
        message: message,
        data: data,
        index: spiderData([message, group, data])
      }

      return arango.q(aql`
        INSERT ${entry} IN entries
      `)
    }

    const logError = async function (message, data = null, group = null) {
      data = JSON.decycle(data)

      const entry = {
        number: (await getNumber(`entry`)),
        createdAt: new Date(),
        operationKey: operation._key,
        type: `error`,
        groupName: group,
        message: message,
        data: data,
        index: spiderData([message, group, data])
      }

      await arango.q(aql`
        INSERT ${entry} IN entries
      `)
      throw new Error(ERROR_STRING)
    }

    const isCancelled = async function () {
      const op = await arango.qNext(aql`
        RETURN DOCUMENT('operations', ${operation._key})
      `)

      if (op.status === `cancelled`) {
        return true
      }

      return false
    }

    return {
      saveOpData,
      saveTaskData,
      log,
      logInfo,
      logWarning,
      logError,
      isCancelled
    }
  }

  const run = async function () {
    try {
      if (firstRun) {
        firstRun = false
        await recoverStuckOperations()
      }

      await startTasks()
    } catch (err) {
      console.log(err)
    }
  }

  const runTask = async function (operation) {
    const userServices = substruct.services.userServices
    const userConfig = substruct.services.userConfig

    try {
      const task = await arango.qNext(aql`
        RETURN DOCUMENT('tasks', ${operation.taskKey})
      `)

      operation.status = `active`
      operation.runDate = new Date()

      await arango.q(aql`
        UPDATE ${operation} in operations
      `)

      const { saveOpData, saveTaskData, log, logInfo, logWarning, logError, isCancelled } = createOpFunctions(operation)

      try {
        const taskFile = taskFiles[task.name]

        let taskData = {}

        if (_.isPlainObject(task.data) && Object.keys(task.data).length >= 0) {
          taskData = task.data
        } else if (_.isFunction(taskFile.defaultData)) {
          taskData = await taskFile.defaultData()
        } else if (_.isPlainObject(taskFile.defaultData)) {
          taskData = taskFile.defaultData
        }

        await logInfo(`Task started`, { taskData, opData: operation.data })

        const result = await taskFile.run({
          config: userConfig,
          services: userServices,
          operation: _.omit(operation, `data`),
          opData: operation.data || {},
          createOp,
          saveOpData,
          taskData,
          saveTaskData,
          logInfo,
          logWarning,
          logError,
          isCancelled
        })

        operation = await arango.qNext(aql`
          RETURN DOCUMENT('operations', ${operation._key})
        `)

        if (operation.status === `active`) {
          await log(`info`, `Task completed`)

          operation.result = result
          operation.status = `completed`
          operation.completedDate = new Date()

          await arango.q(aql`
            UPDATE ${operation} in operations
          `)
        }
      } catch (err) {
        console.log(`=========================================================== TASK ERROR`)
        console.dir(err, { colors: true, depth: null })
        console.log(`======================================================================`)
        if (err.message !== ERROR_STRING) {
          await log(`error`, err.stack, JSON.decycle(err))
        }

        if (task.autoRetry && operation.runCount < 15) {
          operation.status = `failed`
          operation.nextRunDate = moment(Date.now() + 5000 + (Math.pow(2, operation.runCount) * 1000))
        } else {
          operation.status = `terminated`
        }

        operation.runCount += 1
        await arango.q(aql`
          UPDATE ${operation} in operations
        `)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const startTasks = async function () {
    const runningOps = await arango.qAll(aql`
      FOR op IN operations
        FILTER op.status IN ['active']
        SORT op.createdAt ASC
        RETURN op
    `)

    let activeLocks = runningOps.map(op => op.locks)
    activeLocks = _.uniq(activeLocks.flat())

    const headroom = MAX_BATCH_SIZE - runningOps.length

    if (headroom > 0) {
      const operations = await arango.qAll(aql`
        FOR op IN operations
          FILTER op.nextRunDate <= ${new Date()} AND op.status IN ['waiting', 'failed']
          SORT op.createdAt ASC
          LIMIT ${headroom}
          RETURN op
      `)

      for (const operation of operations) {
        // Lockname must be an array for _.intersection to work properly
        const locks = _.isArray(operation.locks) ? operation.locks : [operation.locks]

        if (operation.locks != null && _.intersection(activeLocks, locks).length > 0) {
          continue
        }

        activeLocks = _.uniq(activeLocks.concat(operation.locks))

        runTask(operation)
      }
    }
  }

  const recoverStuckOperations = async function () {
    console.log(`Recovering stuck operations...`)

    const ops = await arango.qAll(aql`
      FOR op IN operations
        FILTER op.status IN ['active', 'waiting', 'failed']
        RETURN op
    `)

    if (config.env === `production`) {
      await Promise.map(ops, async function (operation) {
        const { logWarning } = createOpFunctions(operation)
        if (operation.status === `active`) {
          await logWarning(`Server wen't offline, restarting task...`)
          operation.status = `failed`
          operation.nextRunDate = moment(Date.now() + (Math.pow(2, operation.runCount) * 1000))
          operation.runCount += 1

          await arango.q(aql`
            UPDATE ${operation} in operations
          `)
        }
      })
    } else {
      await Promise.map(ops, async function (operation) {
        const { logWarning } = createOpFunctions(operation)
        await logWarning(`Server started in dev mode, cancelling task...`)

        operation.status = `cancelled`

        await arango.q(aql`
          UPDATE ${operation} in operations
        `)
      })
    }
  }

  const createOp = async function (taskName, data, sourceId = null) {
    const task = await arango.qNext(aql`
      FOR task IN tasks
        FILTER task.name == ${taskName}
        RETURN task
    `)
    const taskFile = taskFiles[task.name]

    console.log(`${new Date()} - Creating new operation for task "${task.name}"`)

    const locks = (function () {
      if (_.isFunction(taskFile.locks)) {
        return taskFile.locks({
          opData: data || {},
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
      number: (await getNumber(`operation`)),
      sourceId: sourceId,
      taskKey: task._key,
      status: `waiting`,
      locks: locks,
      data: data || {},
      runCount: 0,
      nextRunDate: new Date(),
      createdAt: new Date()
    }

    operation = await arango.qNext(aql`
      INSERT ${operation} IN operations RETURN NEW
    `)

    return operation
  }

  return Object.freeze({
    createOp,
    run
  })
}
