
// Sample service syntax which generates any random number between given min-max limit
module.exports = async function ({ config }) {
  const generateRandomNumber = function (min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  return {
    generateRandomNumber
  }
}
