
import numeral from 'numeral'
import moment from 'moment'
import _ from 'lodash'
import cronstrue from 'cronstrue'

const formatters = {
  bytes: function (value) {
    if (value == null) {
      return ``
    }
    return numeral(value).format(`0.0 b`)
  },
  date: function (value) {
    if (value == null) {
      return ``
    }
    return moment(value).format(`ll`)
  },
  dateTime: function (value) {
    if (value == null) {
      return `Never`
    }
    return moment(value).format(`ll LT`)
  },
  dateTimeSeconds: function (value) {
    if (value == null) {
      return `Never`
    }
    return moment(value).format(`ll LTS`)
  },
  money: function (value) {
    if (value == null) {
      return ``
    }
    return numeral(value).format(`$0,000.00`)
  },
  percent: function (value) {
    if (value == null) {
      return ``
    }
    return numeral(value).format(`0%`)
  },
  truncate: function (value, length = 50) {
    if (value == null) {
      return ``
    }
    return _.truncate(value, { length: length })
  },
  capitalize: function (value) {
    return _.capitalize(value)
  },
  dataDisplay: function (value, length = 50) {
    return _.truncate(JSON.stringify(value), { length: length })
  },
  friendlyCronTime: function (value) {
    let text = null
    try {
      text = cronstrue.toString(value)
    } catch (err) {}
    return text
  }
}

export default function (...formatterList) {
  const payload = {}

  formatterList.forEach(function (name) {
    if (formatters[name]) {
      payload[name] = formatters[name]
    }
  })

  return payload
}
