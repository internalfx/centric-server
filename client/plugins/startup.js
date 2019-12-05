import _ from 'lodash'
import '@fortawesome/fontawesome-free/css/all.css'

_.mixin({ isPresent: _.negate(_.isEmpty) })

export default function (ctx, inject) {
  if (process.client) {
    const { app } = ctx

    const setWindowSize = function () {
      app.store.commit('set', {
        'window.width': window.innerWidth,
        'window.height': window.innerHeight
      })
    }

    const setWindowScroll = function () {
      app.store.commit('set', {
        'window.scrollY': window.scrollY
      })
    }

    setWindowSize()
    setWindowScroll()

    window.addEventListener('scroll', _.debounce(setWindowScroll, 100, { maxWait: 333 }))
    window.addEventListener('resize', _.debounce(setWindowSize, 100, { maxWait: 333 }))
  }
}
