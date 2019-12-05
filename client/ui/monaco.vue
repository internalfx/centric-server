
<script>
import * as monaco from 'monaco-editor'
// import _ from 'lodash'

import { mapState } from 'vuex'
// import { log } from 'util'

export default {
  data: function () {
    return {
      editor: null
    }
  },
  props: {
    value: String,
    height: {
      type: String,
      default: '400px'
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    language: {
      type: String
    }
  },
  methods: {
    onInput (evt) {
      this.$emit('input', evt.target.value)
    }
  },
  computed: {
    style: function () {
      return {
        height: `${this.height}`,
        'min-height': '250px'
      }
    },
    ...mapState({
      windowWidth: state => state.window.width,
      windowHeight: state => state.window.height
    })
  },
  mounted: function () {
    this.editor = monaco.editor.create(this.$refs.editor, {
      value: this.value,
      language: 'json',
      readOnly: this.readOnly,
      renderWhitespace: 'all'
    })

    this.editor.getModel().updateOptions({ tabSize: 2 })

    this.editor.getModel().onDidChangeContent((event) => {
      let value = this.editor.getValue()
      if (value.length === 0) {
        value = null
      }
      this.$emit('input', value)
    })
  },
  watch: {
    value: function (val) {
      if (val !== this.editor.getValue()) {
        this.editor.setValue(val)
      }
    },
    height: function () {
      this.editor.layout({ width: 0, height: 0 })
      window.requestAnimationFrame(() => { this.editor.layout() })
    },
    '$vuetify.breakpoint.name': function () {
      this.editor.layout({ width: 0, height: 0 })
      setTimeout(() => { this.editor.layout() }, 300)
    },
    windowWidth: function () {
      this.editor.layout({ width: 0, height: 0 })
      window.requestAnimationFrame(() => { this.editor.layout() })
    }
  },
  beforeDestroy: function () {
    this.editor.getModel().dispose()
  }
}

</script>

<template>
  <div style="border: 1px solid #999;">
    <div ref="editor" :style="style"></div>
  </div>
</template>

<style lang="scss" scoped>
</style>
