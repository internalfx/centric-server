<script>
import { mapState, mapActions } from 'vuex'
import gql from 'graphql-tag'
import { to } from '../../../lib/utils.js'

export default {
  name: 'reset-password',
  computed: {
    ...mapState({
      userKey: state => state.auth.user._key,
    })
  },
  data() {
    return {
      dialog: true,
      newPassword: '',
      confirmPassword: '',
      validForm: false
    }
  },
  methods: {
    passwordMismatch(confirmationPassword) {
      return (!!confirmationPassword && this.newPassword === confirmationPassword) || 'Passwords Do Not Match'
    },
    resetPassword: async function () {
      let user = {
        _key: this.userKey,
        password: this.newPassword
      }
      let res = await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($user: UserPassword!) {
            resetPassword (user: $user) {
              _key
            }
          }
        `,
        variables: {
          user: user,
        }
      }))

      this.$emit('closed')
    }
  }

}
</script>

<template>
  <v-row justify="center">
    <v-dialog @click:outside="$emit('closed')" v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Reset Password</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-form v-model="validForm">
                  <v-col cols="12">
                    <v-text-field v-model="newPassword" label="New Password*" type="password" required></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field :rules="[value => passwordMismatch(value)]" v-model="confirmPassword" label="Confirm Password*" type="password" required></v-text-field>
                  </v-col>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="$emit('closed')">Close</v-btn>
          <v-btn color="blue darken-1" :disabled="!validForm" text @click="resetPassword">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
