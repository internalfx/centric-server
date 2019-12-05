
const substruct = require('@internalfx/substruct')
const config = substruct.config
const userConfig = substruct.services.userConfig

const mailer = substruct.services.mailer
const { arango, aql } = substruct.services.arango

const { uniqueId } = require('../../lib/utils.js')
const moment = require('moment')
const _ = require('lodash')

module.exports = {
  getLink: async function (ctx) {
    const { email } = ctx.request.body || {}

    const user = await arango.qNext(aql`
      for user in users
        filter user.email == ${email} && user.active == true
        return user
    `)

    if (user == null) {
      ctx.throw(400, 'Invalid or Inactive User')
    }

    if (user.loginCode == null || user.loginExpiration == null || moment().isAfter(moment(user.loginExpiration))) {
      user.loginCode = uniqueId(10)
      user.loginExpiration = moment().add(30, 'minutes').toDate()
      user.updatedAt = new Date()

      await arango.q(aql`
        UPDATE { _key: ${user._key} } WITH ${user} IN users
      `)
    }

    const bodyText = `
      <h4>Here is a one-time login code.</h4>
      <h1>${user.loginCode}</h1>

      <p>You may also click this link.</p>
      <a href="${userConfig.baseURL}/login/validate?email=${user.email}&loginCode=${user.loginCode}">Enter Validation Code</a>

      <p>This code will expire in ${moment(user.loginExpiration).diff(moment(), 'minutes')} minutes.<p>
    `

    await mailer.send({
      to: user.email,
      subject: `${config.appName} login`,
      html: bodyText
    })

    if (config.isDevelopment) {
      console.log(user.loginCode)
    }

    ctx.body = {
      success: true
    }
  },

  login: async function (ctx) {
    let { loginCode, email } = ctx.request.body || {}

    if (_.get(ctx, 'state.params.loginCode')) {
      loginCode = _.get(ctx, 'state.params.loginCode')
    }
    if (_.get(ctx, 'state.params.email')) {
      email = _.get(ctx, 'state.params.email')
    }

    if (loginCode == null || email == null) {
      ctx.throw(400, 'Invalid login code')
    }

    const user = await arango.qNext(aql`
      FOR user IN users
        FILTER user.email == ${email} AND user.loginCode == ${loginCode.toUpperCase()}
        RETURN user
    `)

    if (user == null) {
      ctx.throw(400, 'Invalid login code, please login again.')
    }

    const hasExpired = moment().isAfter(moment(user.loginExpiration))

    await arango.q(aql`
      UPDATE { _key: ${user._key} } WITH { loginCode: null, loginExpiration: null, updatedAt: ${new Date()} } IN users
    `)

    if (hasExpired) {
      ctx.throw(400, 'Login code has expired, please login again.')
    }

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
