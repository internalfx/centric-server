
let _ = require('lodash')
// let Promise = require('bluebird')
// let moment = require('moment')
const { gql } = require('apollo-server-koa')
const { uniqueId } = require('../../lib/utils.js')

const typeDefs = gql`
  type TriggerConnection {
    count: Int
    pageCount: Int
    items: [Trigger]
  }

  type Trigger {
    _key: ID
    _id: ID
    name: String
    slug: String
    enabled: Boolean
    createdAt: DateTime
    updatedAt: DateTime

    taskKey: ID
    task: Task
    operations: [Operation]
  }

  input TriggerInput {
    _key: ID
    _id: ID
    name: String
    slug: String
    enabled: Boolean
    taskKey: ID
  }

  extend type Query {
    getTrigger (_key: ID): Trigger
  }

  extend type Mutation {
    upsertTrigger (trigger: TriggerInput!): Trigger
    destroyTrigger (_key: ID!): Trigger
  }
`

const resolvers = {
  Query: {
    getTrigger: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT(triggers, ${args._key})
      `)
    }
  },
  Mutation: {
    upsertTrigger: async function (obj, args, ctx, info) {
      let trigger = args.trigger

      trigger.updatedAt = new Date()

      if (trigger._key == null) {
        trigger.createdAt = new Date()
        trigger.slug = `${_.snakeCase(trigger.name)}_${uniqueId(16)}`
        trigger = await ctx.arango.qNext(ctx.aql`
          INSERT ${trigger} INTO triggers RETURN NEW
        `)
      } else {
        const oldTrigger = await ctx.arango.qNext(ctx.aql`
          RETURN DOCUMENT(triggers, ${trigger._key})
        `)

        if (_.snakeCase(oldTrigger.name) !== _.snakeCase(trigger.name)) {
          trigger.slug = `${_.snakeCase(trigger.name)}_${uniqueId(16)}`
        }

        trigger = await ctx.arango.qNext(ctx.aql`
          UPDATE ${trigger._key} WITH ${trigger} IN triggers RETURN NEW
        `)
      }

      return trigger
    },
    destroyTrigger: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        REMOVE ${args._key} IN triggers RETURN OLD
      `)
    }
  },
  Trigger: {
    task: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        FOR task IN tasks
          FILTER task._key == ${obj.taskKey}
          RETURN task
      `)
    },
    operations: async function (obj, args, ctx, info) {
      return ctx.arango.qAll(ctx.aql`
        FOR operation IN operations
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
