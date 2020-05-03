
const { gql } = require(`apollo-server-koa`)
const requireAll = require(`require-all`)
const path = require(`path`)
const _ = require(`lodash`)

const keyPrefix = `=-_-=`

const collapse = function (obj, depth) {
  const output = {}
  depth = depth || []
  for (let [key, val] of Object.entries(obj)) {
    let hasPrefix = false
    if (key.includes(keyPrefix)) {
      key = key.replace(keyPrefix, ``)
      hasPrefix = true
    }

    if (hasPrefix) {
      if (_.isFunction(val) || _.isString(val) || _.isArray(val) || _.isBoolean(val)) {
        Object.assign(output, { [depth.concat([key]).join(`.`)]: val })
      } else if (_.isObject(val)) {
        Object.assign(output, collapse(val, depth.concat([key])))
      }
    } else {
      Object.assign(output, { [depth.concat([key]).join(`.`)]: val })
    }
  }
  return output
}

const libs = collapse(requireAll({
  dirname: path.join(__dirname, `schema`),
  filter: /(.+)\.js$/,
  recursive: true,
  map: function (name, path) {
    if (path.includes(`.js`)) {
      return name
    } else {
      return keyPrefix + name
    }
  }
}))

const typeDef = gql`
  type Query {
    me: String
  }

  type Mutation {
    me: String
  }
`

const resolver = {
  Query: {
  }
}

const typeDefsList = [
  typeDef,
  ...Object.values(libs).map(lib => lib.typeDefs)
]
const resolverList = [
  resolver,
  ...Object.values(libs).map(lib => lib.resolvers)
]

const schema = {
  typeDefs: typeDefsList,
  resolvers: _.merge(...resolverList)
}

module.exports = schema
