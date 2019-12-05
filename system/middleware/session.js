
const substruct = require('@internalfx/substruct')
const hash = require('object-hash')
const crypto = require('crypto')

const createToken = function (length) {
  const chars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const charLength = chars.length
  const bytes = Array.from(crypto.randomBytes(length))

  const value = bytes.map(function (byte) {
    return chars[byte % charLength]
  })

  return value.join('')
}

module.exports = function (config) {
  const { arango, aql } = substruct.services.arango
  const cookieName = config.session.sessionCookieName

  const loadSession = async function (token) {
    let data = {}

    if (token) {
      data = null

      if (data == null) {
        const storedSession = await arango.qNext(aql`
          FOR x IN sys_sessions
            FILTER x._key == ${token}
            return x
        `)

        if (storedSession != null) {
          data = storedSession.data
        }
      }

      if (data == null) {
        data = {}
      }
    }

    return data
  }

  const saveSession = async function (token, data) {
    const obj = {
      _key: token,
      data
    }

    console.log('WRITE SESSION', obj)

    await arango.q(aql`
      UPSERT ${obj} INSERT ${obj} REPLACE ${obj} IN sys_sessions
    `)
  }

  return async function (ctx, next) {
    let token

    token = ctx.cookies.get(cookieName)

    if (token == null || token.length < 40) {
      token = createToken(40)
    }

    ctx.state.session = await loadSession(token)
    ctx.state.token = token

    const prevSession = hash(ctx.state.session)

    await next()

    const nextSession = hash(ctx.state.session)

    if (nextSession !== prevSession) {
      await saveSession(token, ctx.state.session)
    }
  }
}
