
const delay = async function (time = 0) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

module.exports = {
  description: 'Task to demonstrate task/operation parameters',
  locks: null,
  defaultData: function () {
    return {
      taskCalled: 0,
      taskRunDate: new Date().toDateString()
    }
  },
  run: async function ({ config, services, opData, saveOpData, taskData, saveTaskData, logInfo, logWarning, logError, isCancelled }) {
    // Uses the randomNumberService service to generate random number.
    const generateRandomNumber = services.example.generateRandomNumber

    // 'config' parameter in run method represents the configuration object
    await logInfo('Config loaded..', config)
    await delay(generateRandomNumber(500, 1000))

    // List of services
    await logInfo('Services list...', services)
    await delay(generateRandomNumber(500, 1000))

    // usage of taskData

    // TaskData is common for all the operations performed for single task.
    // Update in taskData of one operation reflects into the other operation of same task.
    await logInfo('Previous Task Data version...', taskData)

    // taskCalled incremented and last taskRunDate updated to today.
    taskData.taskCalled += 1
    taskData.taskRunDate = new Date().toDateString()
    // Updated the task data
    await saveTaskData(taskData)

    await logInfo('Updated task data...', taskData)
    await delay(generateRandomNumber(500, 1000))

    // usage of opData

    opData.operationCalled = opData.operationCalled || 0
    // Operation data tends to one task's specific operation only.
    // operation data updated for current operation will not reflect for other scheduled tasks operation.
    await logInfo('Previous operation-data version', opData)

    // incremented the operationCalled variable and saved the operation data.
    opData.operationCalled += 1
    // saveOpData function stores and updates the operation data into the operations collection which on restart possess the last run details.
    await saveOpData(opData)

    // genrated a random number between 0-100
    const rand = generateRandomNumber(0, 100)

    // If the generated number is greater than 70, it will log error and terminate the operation.
    // If task `AutoRetry = true` the operation will be performed again and the operation data will increment the operationCalled will one.
    // The operationCalled in operation data states the number of times the operation has been called untill it was successfully completed.
    if (rand > 70) {
      await logError('Error occured while processing the operation', opData)
      throw new Error('Random number is greater than 70')
    }

    // Logged the updated operation data
    await logInfo('Updated current operation data', opData)
    await delay(generateRandomNumber(500, 1000))

    // logWarning to log warnings in the running task
    await logWarning('Logging a warning as a test of the emergency warning system. This is only a test....')
    await delay(generateRandomNumber(500, 1000))

    // Fake update record loop to check isCancelled
    // If the task isCancelled true => stop updating and processing task operation
    const limit = generateRandomNumber(1, 4)
    for (let i = 1; i < limit; i += 1) {
      await logInfo('Pretending to update record', {
        updatedRecordId: i
      })
      await delay(generateRandomNumber(50, 300))
      if (await isCancelled()) {
        return
      }
    }
  }
}
