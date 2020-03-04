
<script>
import { to } from '../../lib/utils.js'

export default {
  data: function () {
    return {
      error: null,
      email: null,
      password: null
    }
  },
  components: {
  },
  layout: 'login',
  methods: {
    submit: async function () {
      this.error = null
      const res = await to(this.$auth.loginWith('local', {
        data: {
          email: this.email,
          password: this.password
        }
      }))
      if (res.isError) {
        this.error = res.response.data
      } else {
        this.$router.push('/')
      }
    },
    resetPassword: function () {
      this.$router.push({ path: '/login/reset', query: { email: this.email } })
    }
  }
}
</script>

<template>
  <v-container style="max-width: 600px;">
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>Login</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
      </v-col>
    </v-row>

    <v-alert class="my-6" :value="error" type="error">{{error}}</v-alert>

    <v-text-field v-model="email" label="Email" type="email" outlined />
    <v-text-field v-model="password" label="Password" type="password" outlined @keydown.enter="submit" />

    <v-row class="align-center">
      <v-col cols="auto" class="d-flex">
        <v-btn x-large color="primary" @click="submit">Login</v-btn>
      </v-col>
      <v-col cols="auto" class="d-flex">
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
