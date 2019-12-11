
// let _ = require('lodash')
// let Promise = require('bluebird')
// let moment = require('moment')
const { gql } = require('apollo-server-koa')

const typeDefs = gql`
  type OperationConnection {
    count: Int
    pageCount: Int
    items: [Operation]
  }

  union OperationSource = Schedule | Trigger

  type Operation {
    _key: ID
    _id: ID
    number: Int
    status: String
    lockName: [String]
    runCount: Int
    nextRunDate: DateTime
    runDate: DateTime
    completedDate: DateTime
    data: JSON
    result: JSON
    createdAt: DateTime
    updatedAt: DateTime

    sourceId: ID
    source: OperationSource

    taskKey: ID
    task: Task

    entries (
      page: Int = 1,
      pageSize: Int = 10,
      types: [String] = ["info", "warning", "error"]
    ): EntryConnection

    nextOperationKey: ID
    prevOperationKey: ID
  }

  extend type Query {
    currentOperations: [Operation]
    searchOperations (
      page: Int = 1,
      pageSize: Int = 10,
      search: String = null,
      taskKeys: [ID] = [],
    ): OperationConnection
    getOperation (_key: ID!): Operation
  }

  extend type Mutation {
    cancelOperation (_key: ID!): Operation
    restartOperation (_key: ID!): Operation
  }
`

const resolvers = {
  Query: {
    currentOperations: async function (obj, args, ctx, info) {
      return ctx.arango.qAll(ctx.aql`
        FOR operation IN operations
          FILTER operation.nextRunDate > DATE_SUBTRACT(DATE_NOW(), 4, 'hours')
          SORT operation.nextRunDate DESC
          FILTER
            operation.status NOT IN ['completed', 'cancelled', 'terminated'] OR
            operation.completedDate > DATE_SUBTRACT(DATE_NOW(), 15, 'seconds') AND operation.status == 'completed' OR
            operation.nextRunDate > DATE_SUBTRACT(DATE_NOW(), 1, 'hours') AND operation.status == 'cancelled' OR
            operation.nextRunDate > DATE_SUBTRACT(DATE_NOW(), 4, 'hours') AND operation.status == 'terminated'

          LIMIT 25

          let entries = (
            FOR entry IN entries
              FILTER entry.operationKey == operation._key
              SORT entry.createdAt DESC
              LIMIT 3
              RETURN MERGE(
                KEEP(entry, '_key'),
                { message: LEFT(entry.message, 150) },
                { data: LEFT(JSON_STRINGIFY(entry.data), 150) }
              )
          )

          let task = FIRST(
            FOR task IN tasks
              FILTER task._key == operation.taskKey
              RETURN task
          )

          RETURN MERGE(
            operation,
            {
              entries: {
                items: entries,
                count: COUNT(entries)
              },
              task
            }
          )
      `)
    },
    searchOperations: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const search = args.search
      const taskKeys = args.taskKeys || []

      let items = []
      let count = 0

      console.log(_.isEmpty(search))

      if (_.isEmpty(search)) {
        const res = await ctx.arango.qNext({
          query: `
            let itemCount = (
              FOR operation IN operations
                SORT operation.number DESC
                FILTER LENGTH(@taskKeys) == 0 OR operation.taskKey IN @taskKeys
                return true
            )

            let items = (
              FOR operation IN operations
                SORT operation.number DESC
                FILTER LENGTH(@taskKeys) == 0 OR operation.taskKey IN @taskKeys
                LIMIT @offset, @pageSize
                let entries = (
                  FOR entry IN entries
                    FILTER entry.operationKey == operation._key
                      LIMIT 1
                      RETURN MERGE(
                      UNSET(entry, 'index'),
                      {
                        message: LEFT(entry.message, 150),
                        data: LEFT(JSON_STRINGIFY(entry.data), 150)
                      }
                    )
                )
                RETURN MERGE(
                  operation,
                  {
                    entries: {
                      items: entries,
                      count: COUNT(entries)
                    }
                  }
                )
            )

            RETURN {
              items: items,
              count: COUNT(itemCount)
            }
          `,
          bindVars: {
            taskKeys,
            offset,
            pageSize: args.pageSize
          }
        })

        items = res.items
        count = res.count
      } else {
        const res = await ctx.arango.qNext({
          query: `
            let items = (
              FOR entry IN entriesIndex
                SEARCH Analyzer(STARTS_WITH(entry.index, @search), "identity")
                SORT entry.createdAt DESC
                FILTER LENGTH(@taskKeys) == 0 OR DOCUMENT('operations', entry.operationKey).taskKey IN @taskKeys
                COLLECT operationKey = entry.operationKey
                INTO entries = entry
                let operation = DOCUMENT('operations', operationKey)
                SORT operation.number DESC
                RETURN MERGE(
                  operation,
                  {
                    entries: {
                      items: SLICE(entries, 0, 1),
                      count: COUNT(entries)
                    }
                  }
                )
            )

            RETURN {
              items: SLICE(items, @offset, @pageSize),
              count: COUNT(items)
            }
          `,
          bindVars: {
            search,
            taskKeys,
            offset,
            pageSize: args.pageSize
          }
        })

        items = res.items
        count = res.count
      }

      return {
        count,
        pageCount: Math.ceil(count / args.pageSize),
        items
      }
    },
    getOperation: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('operations', ${args._key})
      `)
    }
  },
  Mutation: {
    cancelOperation: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        FOR operation IN operations
          FILTER operation._key == ${args._key} && operation.status IN ['active','failed','waiting']
          UPDATE operation WITH { status: 'cancelled' } IN operations
          RETURN NEW
      `)
    },
    restartOperation: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        FOR operation IN operations
          FILTER operation._key == ${args._key} && operation.status IN ['failed','cancelled','terminated']
          UPDATE operation WITH { status: 'waiting', nextRunDate: ${new Date()} } IN operations
          RETURN NEW
      `)
    }
  },
  Operation: {
    source: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT(${obj.sourceId})
      `)
    },
    task: async function (obj, args, ctx, info) {
      if (obj.task) {
        return obj.task
      }

      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('tasks', ${obj.taskKey})
      `)
    },
    entries: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)

      if (obj.entries) {
        return obj.entries
      }

      const res = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR entry IN entries
            FILTER entry.operationKey == ${obj._key}
            FILTER entry.type IN ${args.types}
            SORT entry.createdAt DESC
            RETURN entry
        )

        RETURN {
          items: SLICE(items, ${offset}, ${args.pageSize}),
          count: COUNT(items)
        }
      `)

      return {
        count: res.count,
        pageCount: Math.ceil(res.count / args.pageSize),
        items: res.items
      }
    },
    nextOperationKey: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        FOR operation IN operations
          FILTER operation.number > ${obj.number}
          SORT operation.number ASC
          LIMIT 1
          RETURN operation._key
      `)
    },
    prevOperationKey: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        FOR operation IN operations
          FILTER operation.number < ${obj.number}
          SORT operation.number DESC
          LIMIT 1
          RETURN operation._key
      `)
    }
  },
  OperationSource: {
    __resolveType: function (obj, args, ctx, info) {
      console.log(obj, args, ctx, info)
      // if (obj.wingspan) {
      //   return 'Airplane'
      // }

      // if (obj.licensePlate) {
      //   return 'Car'
      // }

      return null
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
