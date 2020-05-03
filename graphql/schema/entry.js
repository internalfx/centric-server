
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

    operationId: ID
    operation: Operation
  }

  extend type Query {
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
      return ctx.arango.qNext(ctx.aql`
        FOR operation IN centric_operations
          FILTER operation._id == ${obj.operationId}
          RETURN operation
      `)
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
