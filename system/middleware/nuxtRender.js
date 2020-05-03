
const substruct = require(`@internalfx/substruct`)
const { pathToRegexp } = require(`path-to-regexp`)

module.exports = function (config) {
  const nuxt = substruct.services.nuxt
  const routeReg = pathToRegexp(`/api/:path*`)

  return async function (ctx, next) {
    if (routeReg.test(ctx.path) === false) {
      ctx.status = 200

      await new Promise((resolve, reject) => {
        ctx.res.on(`close`, resolve)
        ctx.res.on(`finish`, resolve)
        ctx.res.on(`error`, reject)
        nuxt.render(ctx.req, ctx.res)
      })
    }

    await next()
  }
}
