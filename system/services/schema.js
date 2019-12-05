const substruct = require('@internalfx/substruct')
const Promise = require('bluebird')

module.exports = async function (config) {
  const { arango } = substruct.services.arango

  const collectionList = [
    'entries',
    'operations',
    'schedules',
    'sys_sessions',
    'sys_settings',
    'tasks',
    'triggers',
    'users'
  ]

  const indexList = [
    {
      type: 'persistent',
      collection: 'entries',
      fields: ['operationKey'],
      name: 'operationKey',
      deduplicate: false
    }
  ]

  const viewList = [
    {
      name: 'entriesIndex',
      type: 'arangosearch',
      links: {
        entries: {
          analyzers: [],
          fields: {
            index: {
              analyzers: ['identity']
            },
            message: {
              analyzers: ['identity']
            }
          },
          includeAllFields: false
        }
      },
      primarySort: []
    }
  ]

  await Promise.map(collectionList, async function (collectionName) {
    const collection = arango.collection(collectionName)
    const exists = await collection.exists()
    if (exists === false) {
      console.log(`Creating Collection ${collectionName}...`)
      await collection.create()
    }
  })

  await Promise.map(indexList, async function (spec) {
    const collection = arango.collection(spec.collection)
    const existing = await collection.indexes()

    const result = existing.find(i => i.name === spec.name)

    if (result == null) {
      console.log(`Creating Index ${spec.collection}:${spec.name}...`)
      await collection.createIndex(spec)
    }
  })

  await Promise.map(viewList, async function (spec) {
    const view = arango.arangoSearchView(spec.name)
    const exists = await view.exists()

    if (exists === false) {
      console.log(`Creating View ${spec.name}...`)
      await view.create(spec)
    }
  })
}
