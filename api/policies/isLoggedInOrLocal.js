// var jwt = require('jsonwebtoken')

const ipaddr = require(`ipaddr.js`)
const ip = require(`ip`)

module.exports = async function (ctx) {
  const session = ctx.state.session
  const addr = ipaddr.process(ctx.request.ip).toString()

  if (session.userId == null && ip.isLoopback(addr) === false) {
    ctx.throw(403)
    return
  }

  return true
}
