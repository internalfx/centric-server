
<script>
import userRoles from '../../lib/userRoles.js'

export default {
  apollo: {
  },
  data: function () {
    return {
      userRoles
    }
  },
  props: {
    value: Boolean
  },
  components: {
  },
  computed: {
  },
  methods: {

  }
}
</script>

<template>
  <div>
    <v-chip label v-if="value" color="success">
      Yes
    </v-chip>
    <v-chip label v-if="!value" color="secondary">
      No
    </v-chip>
  </div>
</template>

<style lang="scss" scoped>
</style>
