
// let _ = require('lodash')
// let Promise = require('bluebird')
// let moment = require('moment')
const { gql } = require(`apollo-server-koa`)

const typeDefs = gql`
  type EntryConnection {
    count: Int
    pageCount: Int
    items: [Entry]
  }

  type Entry {
    _key: ID
    _id: ID
    number: Int
    type: String
    groupName: String
    message: String
    data: ANY
    createdAt: DateTime

    operationKey: ID
    operation: Operation
  }

  extend type Query {
    searchEntries (
      page: Int = 1,
      pageSize: Int = 10,
      types: [String] = []
    ): EntryConnection
    getEntry (_key: ID): Entry
  }

  input EntryInput {
    _id: ID
    type: String!
    title: String
    content: JSON
    tags: [String]
  }

  # extend type Mutation {
  # }
`

const resolvers = {
  Query: {
    searchEntries: async function (obj, args, ctx, info) {
      const offset = args.pageSize * (args.page - 1)
      const entryTypes = args.types || []

      const { items, count } = await ctx.arango.qNext(ctx.aql`
        let items = (
          FOR entry IN entries
            FILTER entry.type IN ${entryTypes}
            SORT entry.createdAt DESC
            LIMIT ${offset}, ${args.pageSize}
            let operation = DOCUMENT('operations', entry.operationKey)
            RETURN MERGE(entry, { operation })
        )

        let count = (
          FOR entry IN entries
            FILTER entry.type IN ${entryTypes}
            COLLECT WITH COUNT INTO count
            RETURN count
        )

        RETURN {
          items: items,
          count: FIRST(count)
        }
      `)

      return {
        count,
        pageCount: Math.ceil(count / args.pageSize),
        items
      }
    },
    getEntry: async function (obj, args, ctx, info) {
      return ctx.arango.qNext(ctx.aql`
        RETURN DOCUMENT('entries', ${args._key})
      `)
    }
  },
  Mutation: {
  },
  Entry: {
    operation: async function (obj, args, ctx, info) {
      if (obj.operation) {
        return obj.operation
      } else {
        return ctx.arango.qNext(ctx.aql`
          RETURN DOCUMENT('operations', ${obj.operationKey})
        `)
      }
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
