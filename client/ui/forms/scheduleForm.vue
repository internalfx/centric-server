
<script>
import _ from 'lodash'
import cronstrue from 'cronstrue'

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
    enabled: {
      get: function () {
        return this.value.enabled
      },
      set: function (value) {
        this.set({ enabled: value })
      }
    },
    allowMultiple: {
      get: function () {
        return this.value.allowMultiple
      },
      set: function (value) {
        this.set({ allowMultiple: value })
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
      this.$emit(`input`, propVal)
    }
  }
}
</script>

<template>
  <div>
    <v-text-field label="Name" :value="value.name" @input="set({ name: $event })" />
    <v-text-field label="Cron Time" :value="value.cronTime" @input="set({ cronTime: $event })" :hint="friendlyCronTime" persistent-hint />
    <v-switch label="Enabled" v-model="enabled"/>
    <v-switch label="Allow scheduling multiple" v-model="allowMultiple"/>
    <dataEdit :value="value.data" @input="set({data: $event})" label="Data" helpText="Data given to operation" />
  </div>
</template>

<style lang="scss" scoped>
</style>
