
<script>
import _ from 'lodash'
import jsp from 'jsplumb'

const jsPlumb = jsp.jsPlumb

export default {
  data: function () {
    return {
    }
  },
  props: {
  },
  components: {
  },
  computed: {
  },
  methods: {
  },
  mounted: function () {
    console.log(jsp.jsPlumb)
    jsPlumb.setContainer(this.$refs.plumb)

    jsPlumb.draggable([
      this.$refs.item1,
      this.$refs.item2
    ])

    // jsPlumb.connect({
    //   source: this.$refs.item1,
    //   target: this.$refs.item2,
    //   endpoint: 'Rectangle'
    // })

    jsPlumb.addEndpoint(this.$refs.item1, { anchor: `Top` }, { isSource: false, isTarget: true, endpoint: `Rectangle` })
    jsPlumb.addEndpoint(this.$refs.item1, { anchor: `Bottom` }, { isSource: true, isTarget: false })
    jsPlumb.addEndpoint(this.$refs.item2, { anchor: `Top` }, { isSource: false, isTarget: true, endpoint: `Rectangle` })
    jsPlumb.addEndpoint(this.$refs.item2, { anchor: `Bottom` }, { isSource: true, isTarget: false })
  }
}
</script>

<template>
  <div>
    <div ref="plumb" class="plumb">
      <div ref="item1" class="item" style="top: 100px; left: 50px;"></div>
      <div ref="item2" class="item" style="top: 20px; left: 450px;"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.plumb {
  background-color: #edd;
  position: relative;
  width: 100%;
  height: 400px;
}

.item {
  background-color: #99f;
  position: absolute;
  width: 100px;
  height: 100px;
}
</style>
