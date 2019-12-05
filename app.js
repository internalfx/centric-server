const path = require('path')

require('@babel/register')({
  cwd: __dirname,
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  only: [
    './lib/*',
    path.join(process.cwd(), 'services'),
    path.join(process.cwd(), 'tasks'),
    path.join(process.cwd(), 'config.js')
  ]
})

const argv = require('minimist')(process.argv.slice(2))
const substruct = require('@internalfx/substruct')

// const _ = require('lodash')
const { ApolloServer, AuthenticationError, ForbiddenError } = require('apollo-server-koa')
const { typeDefs, resolvers } = require('./graphql/index.js')
require('./lib/cycle.js')

const taskFilePath = path.join(process.cwd(), 'tasks')
const buildContextPath = path.join(process.cwd(), 'context.js')

const port = Number.isFinite(argv.port) ? argv.port : 8000

const config = substruct.configure({
  runDir: process.cwd(),
  appDir: __dirname,
  taskFilePath,
  buildContextPath,
  port
})

const main = async function () {
  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: function (error) {
      const data = JSON.decycle(error)
      console.log('================================================================== GRAPHQL ERROR')
      console.dir(data, { colors: true, depth: null })
      console.log('================================================================================')
      return data
    },
    context: async function ({ ctx }) {
      const session = ctx.state.session
      const { arango, aql, getNumber } = substruct.services.arango

      const user = await arango.qNext(aql`
        for u in users
          filter u._key == ${session.userKey || null}
          return u
      `)

      if (
        session.userId == null &&
        ctx.request.header['x-apikey'] !== config.apiKey
      ) {
        throw new AuthenticationError('You are not logged in')
      }

      const requireAdmin = function () {
        if (user.role !== 'ADM') {
          throw new ForbiddenError('You must be an Administrator to do that.')
        }
      }

      return {
        session,
        arango,
        aql,
        getNumber,
        requireAdmin
      }
    }
  })

  substruct.start().then(async function ({ koa, config }) {
    apollo.applyMiddleware({ app: substruct.koa, path: '/api/graphql' })
    console.log('Server Started...')
  }).catch(function (err) {
    console.error(err.stack)
  })
}

main().catch(function (err) {
  console.log(err)
})
