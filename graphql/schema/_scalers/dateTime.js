
const { GraphQLScalarType } = require(`graphql`)
const { gql } = require(`apollo-server-koa`)
const moment = require(`moment`)

const typeDefs = gql`
  scalar DateTime
`

const resolvers = {
  DateTime: new GraphQLScalarType({
    name: `DateTime`,
    description: `Date/Time value`,
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
