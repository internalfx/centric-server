
const path = require('path')

module.exports = async function (config) {
  const userConfig = require(path.join(config.runDir, 'config.js'))

  if (userConfig[config.env] == null) {
    throw new Error(`Configuration missing for ${config.env} enviornment!`)
  }

  return userConfig[config.env]
}
