module.exports = async function (ctx) {
  let session = ctx.state.session

  if (session.userId == null) { // Check if user is logged in somehow
    ctx.throw(403) // Throw error if false
    return
  }

  return true // Return true to allow controller method to execute.
}
