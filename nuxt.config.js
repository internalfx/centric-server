
const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:8000/api/graphql',
        httpLinkOptions: {
          credentials: 'same-origin'
        }
      }
    }
  },
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get', propertyName: 'user' }
        },
        tokenType: false
      }
    },
    cookie: {
      options: {
        maxAge: 60 * 60 * 24 * 300
      }
    },
    token: {
      prefix: 'centric.'
    },
    localStorage: false,
    rewriteRedirects: true,
    fullPathRedirect: true
  },
  axios: {},
  build: {
    extend: function (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.devtool = 'inline-source-map'
      }
    },
    plugins: [
      new MonacoWebpackPlugin()
    ]
  },
  css: [
  ],
  buildModules: [
    '@nuxtjs/vuetify'
  ],
  env: {},
  head: {
    title: 'Centric Server',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' },
      { hid: 'description', name: 'description', content: 'Centric' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  mode: 'spa',
  loading: { color: '#3B8070' },
  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/auth',
    '@nuxtjs/axios'
  ],
  plugins: [
    'plugins/startup.js'
  ],
  rootDir: path.join(__dirname),
  router: {
    middleware: [
      'auth'
    ]
  },
  srcDir: path.join(__dirname, 'client'),
  vuetify: {
    defaultAssets: false,
    optionsPath: path.join(__dirname, 'client', 'vuetify.options.js')
  }
}
