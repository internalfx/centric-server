
<script>
import gql from 'graphql-tag'
import { to, errMsg } from '../../../lib/utils.js'
import { mapFields } from 'vuex-map-fields'
import _ from 'lodash'

import { mapState, mapActions } from 'vuex'

import userRoles from '../../../lib/userRoles.js'
import userRoleWidget from '../../ui/userRoleWidget.vue'

export default {
  apollo: {
    allUsers: {
      query: gql`
        query allUsers (
          $page: Int,
          $pageSize: Int,
          $search: String,
          $userRole: String
        ) {
          allUsers: allUsers (
            page: $page,
            pageSize: $pageSize,
            search: $search,
            userRole: $userRole
          ) {
            count
            pageCount
            items {
              _key
              _id
              fullName
              firstName
              lastName
              email
              role
              createdAt
              updatedAt
            }
          }
        }
      `,
      variables: function () {
        return {
          page: this.page,
          pageSize: this.pageSize,
          search: this.searchVar,
          userRole: this.userRole
        }
      },
      fetchPolicy: 'no-cache'
    }
  },
  data: function () {
    return {
      searchVar: '',
      headers: [
        { text: 'Name', value: 'fullName', sortable: false },
        { text: 'Email', value: 'email', sortable: false },
        { text: 'Role', value: 'role', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  components: {
    userRoleWidget
  },
  computed: {
    ...mapFields('settings', {
      page: 'users.page',
      pageSize: 'users.pageSize',
      search: 'users.search',
      userRole: 'users.userRole'
    }),
    ...mapState('settings', {
      pageSizeOptions: 'pageSizeOptions'
    }),
    userRoles: function () { return userRoles },
    userRoleList: function () {
      const list = _.cloneDeep(this.userRoles)
      list.unshift({
        text: 'Any Role',
        value: null
      })
      return list
    }
  },
  methods: {
    ...mapActions([
      'showConfirm',
      'showSnackbar'
    ]),
    onClickRow: function (item) {
      this.$router.push({ path: `/users/${item._key}/view` })
    },
    destroy: async function (item) {
      this.inFlight = true

      const choice = await this.showConfirm({
        title: 'Are you sure?',
        body: 'This record will be deleted!'
      })

      if (choice === 'yes') {
        const res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroyUser (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: item._key
          },
          refetchQueries: ['allUsers']
        }))

        if (res.isError) {
          this.showSnackbar({ message: errMsg(res), color: 'error' })
        } else {
          this.showSnackbar({ message: 'Record deleted.', color: 'secondary' })
          this.$router.push('/users')
        }
      }

      this.inFlight = false
    }
  },
  watch: {
    userRole: function () {
      this.page = 1
    },
    search: _.debounce(function (val) {
      this.searchVar = val
      this.page = 1
    }, 333, { maxWait: 1000 })
  }
}
</script>

<template>
  <v-container>
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>Users</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
        <v-btn x-large color="primary" to="/users/create" rounded><v-icon left>fas fa-plus</v-icon> Create User</v-btn>
      </v-col>
    </v-row>

    <v-toolbar>
      <v-select
        v-model="userRole"
        :items="userRoleList"
        hide-details
        solo
        flat
      ></v-select>
      <v-spacer />
      <v-text-field
        v-model="search"
        hide-details
        prepend-icon="fas fa-search"
        placeholder="Search"
        solo
        flat
        clearable
      ></v-text-field>
    </v-toolbar>

    <v-data-table
      :headers="headers"
      :items="allUsers && allUsers.items"
      class="striped clickable"
      item-key="_key"
      no-data-text="No users match your search."
      :items-per-page.sync="pageSize"
      :server-items-length="allUsers && allUsers.count"
      :page.sync="page"
      :footer-props="{
        'items-per-page-options': pageSizeOptions
      }"
      :loading="$apollo.queries.allUsers.loading"
      @click:row="onClickRow"
    >
      <template v-slot:item.role="{item}">
        <userRoleWidget :value="item.role" />
      </template>
      <template v-slot:item.actions="{item}">
        <v-tooltip top>
          <template v-slot:activator="{on}">
            <span v-on="on">
              <v-btn @click.stop text fab small class="ma-0 mr-2" :to="{ path: `/users/${item._key}/edit` }">
                <v-icon>fas fa-pencil-alt</v-icon>
              </v-btn>
            </span>
          </template>
          <span>Edit</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{on}">
            <span v-on="on">
              <v-btn @click.stop text fab small color="error" class="ma-0" @click="destroy(item)">
                <v-icon>fas fa-trash-alt</v-icon>
              </v-btn>
            </span>
          </template>
          <span>Delete</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
