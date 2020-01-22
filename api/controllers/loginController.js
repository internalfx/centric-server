
const substruct = require('@internalfx/substruct')
const config = substruct.config
const userConfig = substruct.services.userConfig

const mailer = substruct.services.mailer
const bcrypt = substruct.services.bcrypt
const { arango, aql } = substruct.services.arango

const { uniqueId } = require('../../lib/utils.js')
const moment = require('moment')
const _ = require('lodash')

module.exports = {

  login: async function (ctx) {
    const { password, email } = ctx.request.body || {}

    if (email == null) {
      ctx.throw(400, 'Invalid login.')
    }

    const user = await arango.qNext(aql`
      FOR user IN users
        FILTER user.email == ${email.toLowerCase()}
        RETURN user
    `)

    if (user == null) {
      ctx.throw(400, 'Invalid password or email.')
    }

    if (password == null) {
      ctx.throw(400, 'Password is required.')
    }

    const check = await bcrypt.checkPassword(password, user.passwordHash)

    if (check.result !== true) {
      ctx.throw(400, 'Invalid password or email.')
    }

    const payload = {
      lastLoginAt: new Date()
    }

    if (check.newHash) {
      payload.passwordHash = check.newHash
    }

    await arango.q(aql`
      UPDATE { _key: ${user._key} } WITH ${payload} IN users
    `)

    ctx.state.session.userKey = user._key

    ctx.body = { token: ctx.state.token }
  },

  logout: async function (ctx) {
    ctx.state.session = {}
    ctx.body = {
      success: true
    }
  },

  user: async function (ctx) {
    const userKey = ctx.state.session.userKey

    if (userKey == null) {
      ctx.status = 200
      ctx.body = {}
      return
    }

    const user = await arango.qNext(aql`
      FOR user IN users
        FILTER user._key == ${userKey}
        RETURN user
    `)

    ctx.body = { user }
  }
}
