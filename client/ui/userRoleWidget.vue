
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
    value: String
  },
  components: {
  },
  computed: {
    roleName: function () {
      let roleObj = this.userRoles.find(i => i.value === this.value)
      if (roleObj != null) {
        return roleObj.text
      }
    },
    color: function () {
      if (this.value === 'USR') {
        return 'secondary'
      } else if (this.value === 'ADM') {
        return 'primary'
      }
    },
    textColor: function () {
      if (this.value === 'USR') {
        return 'secondary'
      } else if (this.value === 'ADM') {
        return 'primary'
      }
    }
  },
  methods: {

  }
}
</script>

<template>
  <div>
    <v-chip :color="color" :text-color="textColor" outlined>
      {{roleName}}
    </v-chip>
  </div>
</template>

<style lang="scss" scoped>
</style>
