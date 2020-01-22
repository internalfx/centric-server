
// General Configuration
//
// options in this file are overidden by keys in environment specific files. e.g. dev.js or prod.js

module.exports = {
  appName: 'Centric Server',
  middleware: [
    'performance',
    'body',
    'httpError',
    'session',
    'router',
    'nuxtRender'
  ],
  services: [
    'userConfig',
    'arango',
    'schema',
    'nuxt',
    'mailer',
    'taskFiles',
    'ejs',
    'userServices',
    'garbageCollector',
    'scheduleManager',
    'operationManager',
    'cron',
    'bcrypt'
  ],
  session: {
    sessionCookieName: 'auth.centric.local',
    sessionCookieMaxAge: 1000 * 60 * 60 * 24 * 365
  }
}
