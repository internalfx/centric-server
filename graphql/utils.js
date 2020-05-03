
const _ = require(`lodash`)

const listSubFields = function (fieldNodes) {
  const selections = _.get(fieldNodes, `[0].selectionSet.selections`)

  return selections.map(s => _.get(s, `name.value`))
}

module.exports = {
  listSubFields
}
