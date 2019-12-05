
let { GraphQLScalarType } = require('graphql')
let { gql } = require('apollo-server-koa')
let moment = require('moment')

let typeDefs = gql`
  scalar DateTime
`

let resolvers = {
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'Date/Time value',
    parseValue: function (value) {
      let result = null

      if (value != null) {
        result = moment(value).toDate()
      }

      return result
    },
    serialize: function (value) {
      let result = null

      if (value != null) {
        result = moment(value).toISOString()
      }

      return result
    },
    parseLiteral: function (ast) {
      if (ast.value == null) {
        return null
      }

      return moment(ast.value).toDate()
    }
  })
}

module.exports = {
  typeDefs,
  resolvers
}
