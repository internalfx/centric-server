
import _ from 'lodash'
import crypto from 'crypto'

const encode = function (val) {
  return encodeURIComponent(val)
    .replace(/%40/gi, `@`)
    .replace(/%3A/gi, `:`)
    .replace(/%24/g, `$`)
    .replace(/%2C/gi, `,`)
    .replace(/%20/g, `+`)
    .replace(/%5B/gi, `[`)
    .replace(/%5D/gi, `]`)
}

export const to = function (promise) {
  return promise.then(function (val) {
    return val || {}
  }).catch(function (err) {
    err.isError = true
    return err
  })
}

export const uniqueId = function (length = 10) {
  const chars = `1234567890BCDFGHJKMNPQRSTVWXYZ`
  const bytes = Array.from(crypto.randomBytes(length))

  const value = bytes.map(function (byte, idx) {
    return chars[byte % chars.length].toString()
  })

  return value.join(``)
}

export const createId = function () {
  return `${Date.now()}X${uniqueId(8).toLowerCase()}`
}

export const errMsg = function (err) {
  if (process.env.isDevelopment) {
    console.log(JSON.stringify(err))
  }

  const messagePaths = [
    `graphQLErrors[0].message`,
    `networkError.result.errors[0].message`
  ]
  let message = null

  for (const path of messagePaths) {
    message = _.get(err, path)

    if (message != null) {
      break
    }
  }

  return message
}

export const buildQueryString = function (params) {
  const parts = []

  for (let [key, val] of Object.entries(params)) {
    if (val === null || typeof val === `undefined`) {
      continue
    }

    if (_.isArray(val)) {
      key = key + `[]`
    } else {
      val = [val]
    }

    for (let value of val) {
      if (_.isDate(value)) {
        value = value.toISOString()
      } else if (_.isObject(value)) {
        value = JSON.stringify(value)
      }

      parts.push(encode(key) + `=` + encode(value))
    }
  }

  const serializedParams = parts.join(`&`)

  return serializedParams
}

export const cleanMutation = function (value) {
  if (value === null || value === undefined) {
    return value
  } else if (Array.isArray(value)) {
    return value.map(v => cleanMutation(v))
  } else if (typeof value === `object`) {
    const newObj = {}
    Object.entries(value).forEach(([key, v]) => {
      if (key !== `__typename`) {
        newObj[key] = cleanMutation(v)
      }
    })
    return newObj
  }

  return value
}

export const spiderData = function (data) {
  const index = new Set()

  const processData = function (data, index) {
    if (_.isString(data)) {
      index.add(data.toLowerCase().slice(0, 75))
    } else if (Number.isFinite(data)) {
      index.add(`${data}`.slice(0, 75))
    } else if (_.isArray(data)) {
      for (const item of data) {
        processData(item, index)
      }
    } else if (_.isObject(data)) {
      for (const item of Object.values(data)) {
        processData(item, index)
      }
    }
  }

  processData(data, index)

  let result = [...index]

  result = result.filter(function (item) {
    if (item.length < 2) {
      return false
    }

    return true
  })

  result = _.compact(result)

  return result
}
