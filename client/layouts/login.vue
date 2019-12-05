<script>
</script>

<template>
  <v-app>
    <v-app-bar app clipped-left dark color="secondary">
      <v-toolbar-title @click="$router.push('/')" class="clickable">
        <h2>Centric Server</h2>
      </v-toolbar-title>
    </v-app-bar>

    <v-content>
      <nuxt/>
    </v-content>
  </v-app>
</template>

<style>
</style>

