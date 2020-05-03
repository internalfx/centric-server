
const requireAll = require(`require-all`)
const path = require(`path`)
const substruct = require(`@internalfx/substruct`)

module.exports = async function (config) {
  const userConfig = substruct.services.userConfig
  const { createOp } = substruct.services.operationManager
  const services = {}
  const userServices = requireAll({
    dirname: path.join(config.runDir, `services`)
  })

  for (const name of userConfig.services) {
    if (userServices[name] == null) {
      throw new Error(`"${name}" service not found.`)
    }
    const fn = userServices[name]
    services[name] = await Promise.resolve(fn({ config: userConfig, services, createOp }))
  }

  return services
}
