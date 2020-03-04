
<script>
import _ from 'lodash'

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
    name: {
      get: function () {
        return this.value.name
      },
      set: function (value) {
        this.set({ name: value })
      }
    },
    // slug: {
    //   get: function () {
    //     return this.value.slug
    //   },
    //   set: function (value) {
    //     this.set({ slug: value })
    //   }
    // },
    enabled: {
      get: function () {
        return this.value.enabled
      },
      set: function (value) {
        this.set({ enabled: value })
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
    // checkSlug: function () {
    //   if (_.isEmpty(this.value.slug)) {
    //     this.set({ slug: _.snakeCase(this.value.name) })
    //   }
    // }
  }
}

</script>

<template>
  <div>
    <v-text-field label="Name" v-model="name" />
    <v-switch label="Enabled" v-model="enabled"/>
  </div>
</template>

<style lang="scss" scoped>
</style>
