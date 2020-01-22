
const substruct = require('@internalfx/substruct')

module.exports = async function (config) {
  const { Nuxt, Builder } = require('nuxt')
  const nuxtConfig = require('../../nuxt.config.js')
  const userConfig = substruct.services.userConfig

  // Config Overrides
  nuxtConfig.dev = (config.env !== 'production')
  nuxtConfig.axios.baseURL = userConfig.baseURL
  nuxtConfig.apollo.clientConfigs.default.httpEndpoint = `${userConfig.baseURL}/api/graphql`
  nuxtConfig.env.baseURL = userConfig.baseURL
  nuxtConfig.env.isDevelopment = (config.env === 'development')

  const nuxt = new Nuxt(nuxtConfig)

  await nuxt.ready()

  if (config.build) {
    new Builder(nuxt).build()
  }

  return nuxt
}
