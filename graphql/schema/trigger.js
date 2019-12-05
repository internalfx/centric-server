
// let _ = require('lodash')
// let Promise = require('bluebird')
// let moment = require('moment')
const { gql } = require('apollo-server-koa')

const typeDefs = gql`
  type TriggerConnection {
    count: Int
    pageCount: Int
    items: [Trigger]
  }

  type Trigger {
    _key: ID
    _id: ID
    taskId: ID
    name: String
    enabled: Boolean

    task: Task
    operations: [Operation]
  }

  input TriggerInput {
    _key: ID
    _id: ID
    taskId: ID
    name: String
    enabled: Boolean
  }

  extend type Query {
    getTrigger (_key: ID): Trigger
  }

  extend type Mutation {
    upsertTrigger (trigger: TriggerInput!): Schedule
    destroyTrigger (_key: ID!): Boolean
  }
`

const resolvers = {
  Query: {
    getTrigger: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT(centric_triggers, ${args._key})
      `)
    }
  },
  Mutation: {
    upsertTrigger: async function (obj, args, ctx, info) {
      let trigger = args.trigger

      trigger.updatedAt = new Date()

      if (trigger._key == null) {
        trigger.createdAt = new Date()
        trigger = await ctx.arango.qNext(ctx.aql`
          INSERT ${trigger} INTO centric_triggers RETURN NEW
        `)
      } else {
        trigger = await ctx.arango.qNext(ctx.aql`
          UPDATE ${trigger._key} WITH ${trigger} IN centric_triggers RETURN NEW
        `)
      }

      return trigger
    },
    destroyTrigger: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        REMOVE ${args._key} IN centric_triggers
      `)
    }
  },
  Trigger: {
    task: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        FOR task IN centric_tasks
          FILTER task._id == ${obj.taskId}
          RETURN task
      `)
    },
    operations: async function (obj, args, ctx, info) {
      return ctx.arango.qAll(ctx.aql`
        FOR operation IN centric_operations
          FILTER operation.sourceId == ${obj._id}
          RETURN operation
      `)
    }

  }
}

module.exports = {
  typeDefs,
  resolvers
}
