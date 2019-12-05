
<script>
export default {
  props: {
    value: {
      type: String
    }
  },
  computed: {
    theme: function () {
      if (this.value === 'waiting') {
        return {
          icon: 'fas fa-fw fa-clock',
          color: 'info',
          textColor: 'white',
          outlined: false
        }
      } else if (this.value === 'active') {
        return {
          icon: 'fas fa-fw fa-spin fa-spinner',
          color: 'indigo',
          textColor: 'white',
          outlined: false
        }
      } else if (this.value === 'completed') {
        return {
          icon: 'fas fa-fw fa-check-circle',
          color: 'success',
          textColor: 'white',
          outlined: false
        }
      } else if (this.value === 'cancelled') {
        return {
          icon: 'fas fa-fw fa-stop-circle',
          color: 'error',
          textColor: 'white',
          outlined: false
        }
      } else if (this.value === 'failed') {
        return {
          icon: 'fas fa-fw fa-exclamation-circle',
          color: 'warning',
          textColor: 'white',
          outlined: false
        }
      } else if (this.value === 'terminated') {
        return {
          icon: 'fas fa-fw fa-times-circle',
          color: 'black',
          textColor: 'error lighten-0',
          outlined: false
        }
      } else {
        return {
          icon: 'fas fa-fw fa-circle',
          color: 'gray',
          textColor: 'black',
          outlined: true
        }
      }
    }
  }
}
</script>

<template>
  <v-chip class="chip" :outlined="theme.outlined" :color="theme.color" :text-color="theme.textColor">
    <v-icon left>{{theme.icon}}</v-icon>
    <span class="status font-weight-bold">{{value}}</span>
  </v-chip>
</template>

<style lang="scss" scoped>

.status {
  text-transform: capitalize;
}

.chip {
  padding: 0 13px 0 7px;
}

</style>

