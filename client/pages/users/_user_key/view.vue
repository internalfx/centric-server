
<script>
// import _ from 'lodash'
import gql from 'graphql-tag'
import { to, errMsg } from '../../../../lib/utils.js'
import format from '../../../../lib/format.js'
import { mapState, mapActions } from 'vuex'
// import { mapFields } from 'vuex-map-fields'

import userRoleWidget from '../../../ui/userRoleWidget.vue'

export default {
  apollo: {
    userRecord: {
      query: gql`
        query getUser (
          $_key: ID!

        ) {
          userRecord: getUser (_key: $_key) {
            _key
            firstName
            lastName
            fullName
            email
            role
            createdAt
            updatedAt
          }
        }
      `,
      variables: function () {
        return {
          _key: this.$route.params.user_key
        }
      },
      fetchPolicy: 'no-cache'
    }
  },
  data: function () {
    return {
    }
  },
  components: {
    userRoleWidget
  },
  computed: {
    ...mapState({
      user: state => state.auth.user
    }),
    ...mapState('settings', {
      pageSizeOptions: 'pageSizeOptions'
    })
  },
  methods: {
    ...format('dateTime'),
    ...mapActions([
      'showSnackbar',
      'showConfirm'
    ]),
    destroy: async function (item) {
      this.inFlight = true

      const choice = await this.showConfirm({
        title: 'Are you sure?',
        body: 'This form will be deleted!'
      })

      if (choice === 'yes') {
        const res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroyForm (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: item._key
          },
          refetchQueries: ['getUser']
        }))

        if (res.isError) {
          this.showSnackbar({ message: errMsg(res), color: 'error' })
        } else {
          this.showSnackbar({ message: 'Form deleted.', color: 'success' })
        }
      }

      this.inFlight = false
    },
    onClickRow: function (item) {
      this.$router.push({ path: '/forms/view', query: { _key: item._key } })
    }
  },
  mounted: function () {
  }
}
</script>

<template>
  <v-container>
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>View User</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
        <v-btn x-large v-if="user.role === 'ADM'" color="primary" :to="{ path: '/users/edit', query: { _key: this.$route.query._key } }" rounded>
          <v-icon left>fas fa-pencil-alt</v-icon> Edit User
        </v-btn>
      </v-col>
    </v-row>

    <div v-if="userRecord">
      <v-card class="pa-3">
        <v-row class="mb-3">
          <v-col cols="">
            <v-simple-table>
              <tbody>
                <tr>
                  <td>Name:</td>
                  <td>{{userRecord.fullName}}</td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>{{userRecord.email}}</td>
                </tr>
                <tr>
                  <td>Role:</td>
                  <td><userRoleWidget :value="userRecord.role" /></td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-col>
          <v-col cols="">
            <v-simple-table>
              <tbody>
                <tr>
                  <td>createdAt:</td>
                  <td>{{dateTime(userRecord.createdAt)}}</td>
                </tr>
                <tr>
                  <td>updatedAt:</td>
                  <td>{{dateTime(userRecord.updatedAt)}}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-card>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
