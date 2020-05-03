
module.exports = {
  'post /api/auth/getLink': `loginController.getLink`,
  'post /api/auth/login': `loginController.login`,
  'post /api/auth/logout': `loginController.logout`,
  'get /api/auth/user': `loginController.user`,

  'post /api/t/:slug': `triggerController.run`
}
