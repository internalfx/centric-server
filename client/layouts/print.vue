<script>
// import { mapState } from 'vuex'
// import { mapFields } from 'vuex-map-fields'

export default {
  data: function () {
    return {
    }
  },
  mounted: function () {
    setTimeout(function () {
      window.print()
    }, 500)
  }
}
</script>

<template>
  <v-app>
    <v-content>
      <nuxt :key="$route.fullPath" />
    </v-content>
  </v-app>
</template>

<style lang="scss">
// @media print {
//   body {
//     padding: 0 !important;
//   }

//   @page {
//     margin: 1.5cm;
//     size: letter landscape;
//   }
// }

// @media print {
//   // html, body {
//     // width: 1000px;
//     // height: 297mm;
//   // }
//   /* ... the rest of the rules ... */
// }

</style>
