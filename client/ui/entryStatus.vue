
<script>
export default {
  props: {
    value: {
      type: String
    },
    compact: Boolean
  },
  computed: {
    theme: function () {
      if (this.value === 'info') {
        return {
          icon: 'fas fa-fw fa-info-circle',
          color: 'info',
          textColor: 'white',
          outlined: false
        }
      } else if (this.value === 'warning') {
        return {
          icon: 'fas fa-fw fa-exclamation-circle',
          color: 'warning',
          textColor: 'white',
          outlined: false
        }
      } else if (this.value === 'error') {
        return {
          icon: 'fas fa-fw fa-times-circle',
          color: 'error',
          textColor: 'white',
          outlined: false
        }
      }

      return null
    }
  }
}
</script>

<template>

  <v-tooltip top>
    <template v-slot:activator="{ on }">
      <span v-on="on">
        <v-chip class="chip" :class="{ compact }" :outlined="theme.outlined" :color="theme.color" :text-color="theme.textColor">
          <v-icon :left="!compact">{{theme.icon}}</v-icon>
          <span v-if="!compact" class="status">{{value}}</span>
        </v-chip>
      </span>
    </template>
    <span class="status">{{value}}</span>
  </v-tooltip>
</template>

<style lang="scss" scoped>

.status {
  text-transform: capitalize;
}

.chip {
  padding: 0 13px 0 7px;

  &.compact {
    padding: 0 1px;
  }
}

</style>

