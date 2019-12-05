
<script>
import monaco from './monaco.vue'
import _ from 'lodash'

export default {
  data: function () {
    return {
      error: null
    }
  },
  props: {
    value: {},
    label: String,
    height: {
      type: String
    },
    helpText: String,
    readOnly: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'json'
    }

  },
  components: {
    monaco
  },
  methods: {
    onInput (val) {
      if (this.language === 'json') {
        try {
          val = JSON.parse(val)
          this.$emit('input', val)
          this.error = null
        } catch (err) {
          this.error = err.message
        }
      } else {
        this.$emit('input', val)
        this.error = null
      }
    }
  },
  computed: {
    stringVal: function () {
      if (_.isObject(this.value)) {
        return JSON.stringify(this.value, null, 2)
      } else if (_.isString(this.value)) {
        return this.value
      } else {
        return ''
      }
    }
  },
  mounted: function () {
  },
  watch: {
  }
}
</script>

<template>
  <div class="field-group">
    <h5>{{ label }} <span v-if="error" class="badge badge-danger"><strong>{{error}}</strong></span></h5>
    <div>
      <monaco
        :value="stringVal"
        @input="onInput"
        :height="height"
        :readOnly="readOnly"
        :language="language"
      />
    </div>
    <small v-if="helpText">{{ helpText }}</small>
  </div>
</template>

<style lang="scss" scoped>
</style>
