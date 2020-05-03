
// import colors from 'vuetify/lib/util/colors'
// import _ from 'lodash'

export default function ({ app }) {
  const config = {
    icons: {
      iconfont: `fa`
    },
    theme: {
      themes: {
        light: {
          primary: `#1D4F90`,
          secondary: `#669EBA`,
          accent: `#F15922`
        }
      },
      options: {
        customProperties: true
      }
    }
  }

  return config
}
