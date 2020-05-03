const requireAll = require(`require-all`)
const _ = require(`lodash`)
const Promise = require(`bluebird`)
const chokidar = require(`chokidar`)
const path = require(`path`)

const keyPrefix = `=-_-=`

const collapse = function (obj) {
  let output = {}
  for (let [key, val] of Object.entries(obj)) {
    let hasPrefix = false
    if (key.includes(keyPrefix)) {
      key = key.replace(keyPrefix, ``)
      hasPrefix = true
    }

    if (hasPrefix) {
      if (_.isFunction(val) || _.isString(val) || _.isArray(val) || _.isBoolean(val)) {
        output = { ...output, [key]: val }
      } else if (_.isObject(val)) {
        output = { ...output, ...collapse(val) }
      }
    } else {
      output = { ...output, [key]: val }
    }
  }
  return output
}

module.exports = async function (config) {
  const substruct = require(`@internalfx/substruct`)
  const { arango, aql } = substruct.services.arango
  console.log(`Loading tasks...`)

  const nameList = []

  const taskFiles = collapse(requireAll({
    dirname: config.taskFilePath,
    filter: /(.+)\.js$/,
    recursive: true,
    map: function (name, path) {
      if (path.includes(`.js`)) {
        if (nameList.includes(name)) {
          throw new Error(`Task file already exists with this name "${name}"`)
        }
        nameList.push(name)
        return name
      } else {
        return keyPrefix + name
      }
    }
  }))

  // console.log(taskFiles)

  await Promise.map(Object.entries(taskFiles), async function ([name, taskObj]) {
    let task = await arango.qNext(aql`
      FOR t IN tasks
        FILTER t.name == ${name}
        return t
    `)

    if (task == null) {
      task = {
        name,
        enabled: false,
        valid: true,
        autoRetry: false
      }

      task = await arango.qNext(aql`
        INSERT ${task} IN tasks RETURN NEW
      `)
    }

    // console.log(taskObj)

    task.description = taskObj.description || null
    task.locks = taskObj.locks || []

    if (config.env === `development`) {
      task.enabled = false
    }

    await arango.q(aql`
      UPDATE ${task._key} WITH ${task} IN tasks
    `)
  })

  const tasks = await arango.qAll(aql`
    FOR t IN tasks
      return t
  `)

  for (const task of tasks) {
    task.valid = taskFiles[task.name] != null

    await arango.qNext(aql`
      UPDATE ${task._key} WITH ${task} IN tasks
    `)
  }

  if (config.isDevelopment) {
    console.log(`Watching tasks...`)
    // console.log(require.cache)
    const watcher = chokidar.watch(`./tasks/`, {
      ignored: /[/\\]\./,
      persistent: true,
      ignoreInitial: true,
      usePolling: true,
      interval: 300,
      binaryInterval: 300,
      cwd: process.cwd()
    })

    watcher.on(`all`, async function (event, filePath) {
      if ([`change`].includes(event)) {
        console.log(`Hot reloading tasks...`)

        const cacheKey = path.resolve(filePath)
        delete require.cache[cacheKey]

        const reloadedFiles = collapse(requireAll({
          dirname: config.taskFilePath,
          filter: /(.+)\.js$/,
          recursive: true,
          map: function (name, path) {
            if (path.includes(`.js`)) {
              return name
            } else {
              return keyPrefix + name
            }
          }
        }))

        for (const [key, val] of Object.entries(reloadedFiles)) {
          taskFiles[key] = val
        }
      }
    })
  }

  return taskFiles
}
