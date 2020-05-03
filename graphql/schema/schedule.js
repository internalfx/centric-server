
// let _ = require('lodash')
// let Promise = require('bluebird')
// let moment = require('moment')
const { gql } = require(`apollo-server-koa`)
const substruct = require(`@internalfx/substruct`)

const typeDefs = gql`
  type ScheduleConnection {
    count: Int
    pageCount: Int
    items: [Schedule]
  }

  type Schedule {
    _key: ID
    _id: ID
    name: String
    cronTime: String
    enabled: Boolean
    data: JSON
    createdAt: DateTime
    updatedAt: DateTime

    taskKey: ID
    task: Task
    operations: [Operation]
  }

  input ScheduleInput {
    _key: ID
    _id: ID
    name: String
    cronTime: String
    enabled: Boolean
    data: JSON
    taskKey: ID
  }

  extend type Query {
    getSchedule (_key: ID): Schedule
  }

  extend type Mutation {
    upsertSchedule (schedule: ScheduleInput!): Schedule
    destroySchedule (_key: ID!): Schedule
    runScheduleNow (_key: ID!): Operation
  }
`

const resolvers = {
  Query: {
    getSchedule: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT(schedules, ${args._key})
      `)
    }
  },
  Mutation: {
    upsertSchedule: async function (obj, args, ctx, info) {
      let schedule = args.schedule

      schedule.updatedAt = new Date()

      if (schedule._key == null) {
        schedule.createdAt = new Date()
        schedule = await ctx.arango.qNext(ctx.aql`
          INSERT ${schedule} INTO schedules RETURN NEW
        `)
      } else {
        schedule = await ctx.arango.qNext(ctx.aql`
          UPDATE ${schedule._key} WITH ${schedule} IN schedules OPTIONS { mergeObjects: false } RETURN NEW
        `)
      }

      return schedule
    },
    destroySchedule: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        REMOVE ${args._key} IN schedules RETURN OLD
      `)
    },
    runScheduleNow: async function (obj, args, ctx, info) {
      const scheduleManager = substruct.services.scheduleManager
      const operation = await scheduleManager.createScheduledOp(args._key)
      return operation
    }
  },
  Schedule: {
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
