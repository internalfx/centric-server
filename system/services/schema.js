const substruct = require('@internalfx/substruct')
const Promise = require('bluebird')
const _ = require('lodash')

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
      collection: 'entries',
      deduplicate: false,
      fields: ['operationKey', 'type'],
      name: 'operationKey-type',
      type: 'persistent',
      unique: false
    },
    {
      collection: 'operations',
      deduplicate: false,
      fields: ['number'],
      name: 'number',
      type: 'persistent',
      unique: true
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
          includeAllFields: true
        }
      },
      primarySort: [
        {
          field: 'createdAt',
          direction: 'desc'
        }
      ]
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
    const indexList = await collection.indexes()

    const existing = indexList.find(i => i.name === spec.name)

    if (existing != null) {
      const existingComp = _.pick(existing, 'deduplicate', 'fields', 'name', 'type', 'unique')
      const specComp = _.pick(spec, 'deduplicate', 'fields', 'name', 'type', 'unique')

      if (!_.isEqual(existingComp, specComp)) {
        console.log(`Recreating Index ${spec.collection}:${spec.name}...`)
        await collection.dropIndex(existing.id)
        await collection.createIndex(spec)
      }
    } else {
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
