
const substruct = require(`@internalfx/substruct`)
const { arango, aql } = substruct.services.arango
// let moment = require('moment')
const _ = require(`lodash`)
// let config = substruct.config
const { createOp } = substruct.services.operationManager

module.exports = {
  run: async function (ctx) {
    const { slug } = ctx.state.params
    const body = ctx.request.body
    const query = ctx.query

    if (slug == null) {
      ctx.throw(404)
    }

    const trigger = await arango.qNext(aql`
      FOR trigger in triggers
        FILTER trigger.slug == ${slug}
        RETURN trigger
    `)

    if (trigger == null) {
      ctx.throw(404)
    }

    if (trigger.enabled !== true) {
      ctx.throw(400, `Trigger is disabled`)
    }

    const task = await arango.qNext(aql`RETURN DOCUMENT(tasks, ${trigger.taskKey})`)

    if (task == null) {
      ctx.throw(400, `Task is null`)
    }

    if (task.enabled !== true) {
      ctx.throw(400, `Task is disabled`)
    }

    const operation = await createOp(task.name, { body, query }, trigger._id)

    ctx.body = _.pick(operation, `_key`, `number`, `status`, `locks`, `body`, `runCount`, `nextRunDate`, `createdAt`)
  }
}
