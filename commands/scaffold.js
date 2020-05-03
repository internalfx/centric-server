
const path = require(`path`)
const SAO = require(`sao`)

module.exports = async function () {
  const sao = SAO({
    generator: path.join(__dirname, `..`, `scaffold`),
    outDir: process.cwd()
  })

  await sao.run()
}
