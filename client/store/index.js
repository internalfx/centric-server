
import _ from 'lodash'
import Promise from 'bluebird'
import { getField, updateField } from 'vuex-map-fields'

export const strict = true

export const state = function () {
  return {
    alert: {
      title: null,
      body: null,
      resolve: null
    },
    auth: {
      user: null
    },
    confirm: {
      title: null,
      body: null,
      resolve: null
    },
    snackbar: {
      show: false,
      color: `primary`,
      message: null
    },
    window: {
      width: 0,
      height: 0
    }
  }
}

export const mutations = {
  updateField,
  set: function (state, payload) {
    Object.entries(payload).forEach(function ([key, val]) {
      _.set(state, key, val)
    })
  }
}

export const actions = {
  nuxtServerInit: async function ({ commit }, { app, env }) {
  },

  showAlert: function ({ state, commit }, opts = {}) {
    let { title, body } = opts
    title = title || ``
    body = body || ``
    return new Promise(function (resolve) {
      commit(`set`, {
        'alert.title': title,
        'alert.body': body,
        'alert.resolve': resolve
      })
    }).then(function (choice) {
      commit(`set`, {
        'alert.title': null,
        'alert.body': null,
        'alert.resolve': null
      })

      return choice
    })
  },

  showConfirm: function ({ state, commit }, opts = {}) {
    let { title, body } = opts
    title = title || `Are you sure?`
    body = body || ``
    return new Promise(function (resolve) {
      commit(`set`, {
        'confirm.title': title,
        'confirm.body': body,
        'confirm.resolve': resolve
      })
    }).then(function (choice) {
      commit(`set`, {
        'confirm.title': null,
        'confirm.body': null,
        'confirm.resolve': null
      })

      return choice
    })
  },

  showSnackbar: function ({ state, commit }, payload) {
    let message = ``
    let color = `secondary`
    if (_.isString(payload)) {
      message = payload
    } else {
      message = payload.message
      color = payload.color
    }
    commit(`set`, {
      'snackbar.show': true,
      'snackbar.color': color,
      'snackbar.message': message
    })
  }
}

export const getters = {
  getField
}
