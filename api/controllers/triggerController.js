// let substruct = require('@internalfx/substruct')
// let moment = require('moment')
// let _ = require('lodash')
// let config = substruct.config
// let taskFiles = substruct.services.taskFiles

module.exports = {
  trigger: async function (ctx) {
    const { name } = ctx.state.params
    const data = ctx.request.body

    console.log(name, data)

    // let trigger = await models.trigger.findOne({
    //   where: {
    //     name: {
    //       [Op.eq]: name
    //     }
    //   },
    //   include: [{ model: models.task }]
    // })

    // if (trigger) {
    //   let task = trigger.task
    //   let taskFile = taskFiles[task.name]

    //   let lockName = (function () {
    //     if (_.isFunction(taskFile.lock_name)) {
    //       return taskFile.lock_name({
    //         opData: data,
    //         taskData: task.data
    //       })
    //     } else if (_.isString(taskFile.lock_name)) {
    //       return taskFile.lock_name
    //     } else {
    //       return task.name
    //     }
    //   }.call())

    //   let operation = await models.operation.create({
    //     sourceable: 'trigger',
    //     sourceable_id: trigger.id,
    //     task_id: trigger.task.id,
    //     status: 'waiting',
    //     lock_name: lockName,
    //     data: data,
    //     run_count: 0,
    //     next_run_date: moment().toDate()
    //   })

    //   ctx.body = operation
    // }
  }
}
