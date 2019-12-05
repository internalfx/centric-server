
let _ = require('lodash')

let listSubFields = function (fieldNodes) {
  let selections = _.get(fieldNodes, '[0].selectionSet.selections')

  return selections.map(s => _.get(s, 'name.value'))
}

module.exports = {
  listSubFields
}
