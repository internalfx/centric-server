
const arangojs = require(`arangojs`)
const _ = require(`lodash`)
const substruct = require(`@internalfx/substruct`)

module.exports = async function (config) {
  const userConfig = substruct.services.userConfig

  if (userConfig.arango == null) {
    throw new Error(`ArangoDB config missing! Please add an "arango" section to your config.js file.`)
  }

  const arango = new arangojs.Database({
    url: userConfig.arango.url
  })

  if (userConfig.arango.database) {
    arango.useDatabase(userConfig.arango.database)
  }

  if (userConfig.arango.username && userConfig.arango.password) {
    arango.useBasicAuth(userConfig.arango.username, userConfig.arango.password)
  }

  const numberMap = {
    operation: `operationSequence`,
    entry: `entrySequence`
  }

  const getNumber = async function (type) {
    try {
      const key = numberMap[type]

      if (key == null) {
        throw new Error(`invalid type for getNumber`)
      }

      const collections = {
        exclusive: [`sys_settings`]
      }

      const action = String(function (params) {
        const db = require(`@arangodb`).db
        const aql = require(`@arangodb`).aql

        let setting = db._query(aql`
          FOR setting IN sys_settings
            FILTER setting._key == ${params.key}
            RETURN setting
        `).toArray()

        if (setting.length > 0) {
          setting = setting[0]
        } else {
          setting = db._query(aql`
            INSERT { _key: ${params.key}, value: 0 } IN sys_settings RETURN NEW
          `).toArray()[0]
        }

        let value = setting.value
        value += 1

        db._query(aql`
          UPDATE ${setting} WITH { value: ${value} } IN sys_settings
        `)

        return value
      })

      const params = {
        key
      }

      const number = await arango.transaction(
        collections,
        action,
        params,
        { waitForSync: true }
      )

      return number
    } catch (err) {
      console.log(err)
      // console.log('GETNUMBER WE CAUGHT ONE!!!!! ==============================================')
    }
  }

  const q = async function (...args) {
    let cursor = null
    let attempts = 0

    while (cursor == null) {
      attempts += 1
      try {
        cursor = await arango.query(...args)
      } catch (err) {
        if (err.errorNum !== 1200 || attempts >= 50) {
          console.log(_.get(args, `[0].query`))
          throw err
        }
      }
    }

    return cursor
  }

  const qNext = async function (...args) {
    const cursor = await q(...args)
    return cursor.next()
  }

  const qAll = async function (...args) {
    const cursor = await q(...args)
    return cursor.all()
  }

  arango.q = q
  arango.qNext = qNext
  arango.qAll = qAll

  return {
    arango,
    aql: arangojs.aql,
    getNumber
  }
}
