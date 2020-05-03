
const ejs = require(`ejs`)
const path = require(`path`)
const _ = require(`lodash`)

module.exports = async function (config) {
  const render = async function (templatePath, context) {
    const defaultCtx = {
      production: config.env === `production`,
      development: config.env === `development`
    }

    const locals = { _, ...defaultCtx, ...context }
    return ejs.renderFile(path.join(config.apiDir, `views`, templatePath), locals, {
      async: true,
      cache: config.env === `production`
    })
  }

  return {
    render
  }
}
