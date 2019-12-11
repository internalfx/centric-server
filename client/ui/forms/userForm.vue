
<script>
import _ from 'lodash'

import userRoles from '../../../lib/userRoles.js'

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
  },
  computed: {
    userRoles: function () { return userRoles },
    active: {
      get: function () {
        return this.value.active
      },
      set: function (value) {
        this.set({ active: value })
      }
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
</script>

<template>
  <div>
    <v-text-field label="First name" :value="value.firstName" @input="set({ firstName: $event })" />
    <v-text-field label="Last name" :value="value.lastName" @input="set({ lastName: $event })" />
    <v-text-field label="Email" :value="value.email" @input="set({ email: $event })" type="email" />
        <v-select label="Role" :value="value.role" @input="set({ role: $event })" :items="userRoles" />
    <v-switch label="Active" v-model="active" hint="Should user be allowed to login?" persistent-hint/>
  </div>
</template>

<style lang="scss" scoped>
</style>
