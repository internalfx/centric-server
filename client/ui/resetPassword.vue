<script>
import { mapState, mapActions } from 'vuex'
import gql from 'graphql-tag'
import { to, errMsg } from '../../lib/utils.js'

export default {
  data: function () {
    return {
      inFlight: false,
      oldPassword: null,
      newPassword: null,
      confirmPassword: null
    }
  },
  props: {
    value: Boolean
  },
  computed: {
    ...mapState({
      userKey: state => state.auth.user._key
    })
  },
  methods: {
    ...mapActions([
      `showSnackbar`
    ]),
    save: async function () {
      this.inFlight = true

      const res = await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($userKey: String!, $oldPassword: String!, $newPassword: String!, $confirmPassword: String!) {
            resetPassword (userKey: $userKey, oldPassword: $oldPassword, newPassword: $newPassword, confirmPassword: $confirmPassword) {
              _key
            }
          }
        `,
        variables: {
          userKey: this.userKey,
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword
        }
      }))

      if (res.isError) {
        this.showSnackbar({ message: errMsg(res), color: `error` })
      } else {
        this.showSnackbar({ message: `Password saved.`, color: `success` })
        this.oldPassword = null
        this.newPassword = null
        this.confirmPassword = null
        this.$emit(`closed`)
      }

      this.inFlight = false
    },
    cancel: function () {
      this.oldPassword = null
      this.newPassword = null
      this.confirmPassword = null
      this.$emit(`closed`)
    }
  }

}
</script>

<template>
  <v-dialog v-model="value" persistent max-width="400px">
    <v-card>
      <v-card-title>
        <span class="headline">Reset Password</span>
      </v-card-title>
      <v-card-text>
        <v-text-field v-model="oldPassword" label="Current Password*" type="password"></v-text-field>
        <v-text-field v-model="newPassword" label="New Password*" type="password"></v-text-field>
        <v-text-field v-model="confirmPassword" label="Confirm Password*" type="password"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" :loading="inFlight" :disabled="inFlight" @click="save"><v-icon left>fas fa-save</v-icon> Save</v-btn>
        <v-btn class="ml-7" text color="secondary" @click="cancel"><v-icon left>fas fa-times</v-icon> Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
