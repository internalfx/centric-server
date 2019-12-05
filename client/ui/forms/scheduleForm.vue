
<script>
import _ from 'lodash'
import cronstrue from 'cronstrue'

import userRoles from '../../../lib/userRoles.js'
import dataEdit from '../dataEdit.vue'

export default {
  apollo: {
  },
  data: function () {
    return {
    }
  },
  props: {
    value: Object
  },
  components: {
    dataEdit
  },
  computed: {
    userRoles: function () { return userRoles },
    enabled: {
      get: function () {
        return this.value.enabled
      },
      set: function (value) {
        this.set({ enabled: value })
      }
    },
    friendlyCronTime: function () {
      let text = null
      try {
        text = cronstrue.toString(this.value.cronTime)
      } catch (err) {}
      return text
    }
  },
  methods: {
    set: function (data) {
      const propVal = _.cloneDeep(this.value)
      for (const [key, val] of Object.entries(data)) {
        _.set(propVal, key, val)
      }
      this.$emit('input', propVal)
    }
  }
}

// _key: ID
// _id: ID
// name: String
// cronTime: String
// enabled: Boolean
// data: JSON
// createdAt: DateTime
// updatedAt: DateTime
// taskId: ID
</script>

<template>
  <div>
    <v-text-field label="Name" :value="value.name" @input="set({ name: $event })" />
    <v-text-field label="Cron Time" :value="value.cronTime" @input="set({ cronTime: $event })" :hint="friendlyCronTime" persistent-hint />
    <v-switch label="Enabled" v-model="enabled"/>
    <dataEdit :value="value.data" @input="set({data: $event})" label="Data" helpText="Data given to operation" />
  </div>
</template>

<style lang="scss" scoped>
</style>
