
<script>
import _ from 'lodash'

import workflowEditor from '../editors/workflowEditor.vue'

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
    workflowEditor
  },
  computed: {
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
      this.$emit(`input`, propVal)
    }
  }
}
</script>

<template>
  <div>
    <v-text-field label="Title" :value="value.title" @input="set({ firstName: $event })" />
    <workflowEditor />
  </div>
</template>

<style lang="scss" scoped>
</style>
