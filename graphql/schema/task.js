
// let _ = require('lodash')
// let Promise = require('bluebird')
// let moment = require('moment')
const { gql } = require(`apollo-server-koa`)

const typeDefs = gql`
  type TaskConnection {
    count: Int
    pageCount: Int
    items: [Task]
  }

  type Task {
    _key: ID
    _id: ID
    name: String
    description: String
    enabled: Boolean
    valid: Boolean
    autoRetry: Boolean
    data: JSON
    createdAt: DateTime
    updatedAt: DateTime

    schedules: [Schedule]
    triggers: [Trigger]
    operations: [Operation]
  }

  extend type Query {
    allTasks (
      page: Int = 1,
      pageSize: Int = 10,
      search: String = ""
    ): TaskConnection
    getTask (_key: ID!): Task
    tasksAutocomplete (
      task_keys: [ID!],
      search: String = ""
    ): [Task]
  }

  input TaskInput {
    _key: ID
    enabled: Boolean
    autoRetry: Boolean
    # data: JSON
  }

  extend type Mutation {
    upsertTask (task: TaskInput!): Task
  }
`

const resolvers = {
  Query: {
    allTasks: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = `%${args.search || ``}%`

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR task IN tasks
            FILTER LIKE(task.name, ${search}, true)
            FILTER task.valid == true
            SORT task.name
            RETURN task
        )

        RETURN {
          items: SLICE(items, ${offset}, ${args.pageSize}),
          count: COUNT(items)
        }
      `)

      return {
        count,
        pageCount: Math.ceil(count / args.pageSize),
        items
      }
    },
    getTask: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('tasks', ${args._key})
      `)
    },
    tasksAutocomplete: async function (obj, args, ctx, info) {
      const search = args.search ? `%${args.search}%` : `%%`
      const taskKeys = args.task_keys || []

      return ctx.arango.qAll(ctx.aql`
        let task_keys = (
          FOR task IN tasks
            FILTER LIKE(task.name, ${search}, true)
            SORT task.name ASC
            LIMIT 10
            RETURN task._key
        )

        FOR task IN tasks
          FILTER task._key IN task_keys OR task._key IN ${taskKeys}
          SORT task.name ASC
          RETURN KEEP(task, '_key', 'name')
      `)
    }

  },
  Mutation: {
    upsertTask: async function (obj, args, ctx, info) {
      let record = args.task

      record.updatedAt = new Date()

      record = await ctx.arango.qNext(ctx.aql`
        UPDATE ${record._key} WITH ${record} IN tasks RETURN NEW
      `)

      return record
    }
  },
  Task: {
    operations: async function (obj, args, ctx, info) {
      return ctx.arango.qAll(ctx.aql`
        FOR operation IN operations
          FILTER operation.taskKey == ${obj._key}
          return operation
      `)
    },
    schedules: async function (obj, args, ctx, info) {
      return ctx.arango.qAll(ctx.aql`
        FOR schedule IN schedules
          FILTER schedule.taskKey == ${obj._key}
          return schedule
      `)
    },
    triggers: async function (obj, args, ctx, info) {
      return ctx.arango.qAll(ctx.aql`
        FOR trigger IN triggers
          FILTER trigger.taskKey == ${obj._key}
          return trigger
      `)
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
