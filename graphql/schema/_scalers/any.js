
const { GraphQLScalarType } = require('graphql')
const { gql } = require('apollo-server-koa')
// let _ = require('lodash')

const typeDefs = gql`
  scalar ANY
`

const resolvers = {
  ANY: new GraphQLScalarType({
    name: 'ANY',
    description: 'ANY Data',
    parseValue: function (value) {
      const result = value

      // if (value != null) {
      //   if (_.isPlainObject(value)) {
      //     result = value
      //   } else if (_.isString(value)) {
      //     result = JSON.parse(value)
      //   }
      // }

      return result
    },
    serialize: function (value) {
      const result = value

      // if (value != null && _.isPlainObject(value)) {
      //   result = value
      // }

      return result
    },
    parseLiteral: function (ast) {
      console.log(ast)
      // if (ast.kind === Kind.INT) {
      //   return parseInt(ast.value, 10)
      // }
      return null
    }
  })
}

module.exports = {
  typeDefs,
  resolvers
}
