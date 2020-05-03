
<script>
import _ from 'lodash'
import gql from 'graphql-tag'
import { to, errMsg } from '../../../../lib/utils.js'
import { mapActions } from 'vuex'
// import { mapFields } from 'vuex-map-fields'

import userForm from '../../../ui/forms/userForm.vue'

export default {
  apollo: {
    record: {
      query: gql`
        query getUser ($_key: ID!) {
          record: getUser (_key: $_key) {
            _key
            _id
            firstName
            lastName
            email
            role
          }
        }
      `,
      variables: function () {
        return {
          _key: this.$route.params.user_key
        }
      },
      result: function (res) {
        this.user = _.omit(res.data.record, `__typename`)
      },
      fetchPolicy: `no-cache`
    }
  },
  data: function () {
    return {
      inFlight: false,
      saved: false,
      user: null
    }
  },
  components: {
    userForm
  },
  computed: {
  },
  methods: {
    ...mapActions([
      `showSnackbar`
    ]),
    save: async function () {
      this.inFlight = true
      const res = await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($user: UserInput!) {
            upsertUser (user: $user) {
              _key
              _id
            }
          }
        `,
        variables: {
          user: this.user
        },
        refetchQueries: [`allUsers`]
      }))

      if (res.isError) {
        this.showSnackbar({ message: errMsg(res), color: `error` })
      } else {
        this.showSnackbar({ message: `User saved.`, color: `success` })
        this.$router.push(`/users`)
      }

      this.inFlight = false
    }
  },
  mounted: function () {
    this.form = {}
  }
}
</script>

<template>
  <v-container v-if="user">
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>Edit User</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
      </v-col>
    </v-row>

    <userForm v-model="user" class="mb-3" />

    <v-row>
      <v-col class="d-flex align-center">
        <v-btn x-large color="primary" :loading="inFlight" :disabled="inFlight" @click="save"><v-icon left>fas fa-save</v-icon> Save</v-btn>
        <v-btn class="ml-7" text color="secondary" @click="$router.go(-1)"><v-icon left>fas fa-times</v-icon> Cancel</v-btn>
      </v-col>
      <v-col cols="auto" class="d-flex align-center justify-end">
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
