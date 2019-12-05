
<script>
import { to } from '../../../lib/utils.js'

export default {
  auth: false,
  data: function () {
    return {
      error: null,
      loginCode: null,
      email: null
    }
  },
  components: {
  },
  layout: 'login',
  methods: {
    submit: async function () {
      this.error = null
      let res = await to(this.$auth.loginWith('local', {
        data: {
          loginCode: this.loginCode,
          email: this.email
        }
      }))
      if (res.isError) {
        this.error = res.response.data
      } else {
        this.$router.push('/')
      }
    },
    clear: function () {}
  },
  middleware: ['noLogin'],
  mounted: function () {
    if (this.$route.query.email) {
      this.email = this.$route.query.email
    }
    if (this.$route.query.loginCode) {
      this.loginCode = this.$route.query.loginCode
    }
  }
}
</script>

<template>
  <v-container>
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>Validate Login</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
      </v-col>
    </v-row>

    <p>Check your email. When you receive the login code, you may enter it below.</p>

    <v-text-field v-model="email" label="Email" type="email" outlined />
    <v-text-field v-model="loginCode" label="Login Code" outlined @keydown.enter="submit" />

    <v-btn x-large color="primary" @click="submit">submit</v-btn>

    <v-alert class="mt-6" :value="error" type="error">{{error}}</v-alert>
  </v-container>
</template>

<style>

</style>

