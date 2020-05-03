const ipaddr = require(`ipaddr.js`)
const ip = require(`ip`)

module.exports = async function (ctx) {
  const addr = ipaddr.process(ctx.request.ip).toString()

  if (ip.isLoopback(addr) === false) {
    ctx.throw(403)
    return
  }

  return true
}
