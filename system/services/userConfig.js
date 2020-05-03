
const path = require(`path`)
const fsp = require(`fs`).promises
const { to } = require(`../../lib/utils.js`)

module.exports = async function (config) {
  const configPath = path.join(config.runDir, `config.js`)

  const stat = await to(fsp.stat(configPath))

  if (stat.isError && stat.code === `ENOENT`) {
    throw new Error(`Your config.js file is missing!`)
  }

  const userConfig = require(configPath)

  if (userConfig[config.env] == null) {
    throw new Error(`Configuration missing for ${config.env} enviornment!`)
  }

  return userConfig[config.env]
}
