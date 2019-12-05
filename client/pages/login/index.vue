
<script>
// import { ErrorBag } from 'vee-validate'
import { to } from '../../../lib/utils.js'
// import { log } from 'util'

export default {
  data: function () {
    return {
      error: null,
      email: null
    }
  },
  components: {
  },
  layout: 'login',
  methods: {
    submit: async function () {
      this.error = null
      let res = await to(this.$axios.post('/api/auth/getLink', { email: this.email }))

      if (res.isError) {
        this.error = res.response.data
      } else {
        this.$router.push({ path: '/login/validate', query: { email: this.email } })
      }
    }
  }
}
</script>

<template>
  <v-container>
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>Login</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
      </v-col>
    </v-row>

    <v-text-field v-model="email" label="Email" type="email" outlined @keydown.enter="submit" />

    <v-btn x-large color="primary" @click="submit">submit</v-btn>

    <v-alert class="mt-6" :value="error" type="error">{{error}}</v-alert>
  </v-container>
</template>

<style>

</style>

