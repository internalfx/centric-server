<script>
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
// import axios from 'axios'
// import _ from 'lodash'

import { to } from '../../../lib/utils.js'
// import alert from '../ui/alert.vue'
import gql from 'graphql-tag'

export default {
  apollo: {
    allTasks: {
      query: gql`
        query allTasks (
          $page: Int,
          $pageSize: Int,
          $search: String
        ) {
          allTasks: allTasks (
            page: $page,
            pageSize: $pageSize,
            search: $search
          ) {
            count
            pageCount
            items {
              _key
              _id
              name
              description
              autoRetry
              enabled
              valid
            }
          }
        }
      `,
      variables: function () {
        return {
          page: this.page,
          pageSize: this.pageSize,
          search: this.searchVar
        }
      },
      fetchPolicy: `network-only`
    }
  },
  data: function () {
    return {
      searchVar: ``,
      headers: [
        { text: `Name`, value: `name`, sortable: false },
        { text: `Description`, value: `description`, sortable: false },
        { text: `Auto Retry?`, value: `autoRetry`, sortable: false },
        { text: `Enabled?`, value: `enabled`, sortable: false }
        // { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  components: {
    // vInput,
    // alert
  },
  computed: {
    ...mapFields(`settings`, {
      page: `tasks.page`,
      pageSize: `tasks.pageSize`,
      search: `tasks.search`
    }),
    ...mapState(`settings`, {
      pageSizeOptions: `pageSizeOptions`
    })
  },
  methods: {
    // ...mapActions('tasks', [
    //   'showConfirm'
    // ]),
    updateTask: async function (data) {
      this.inFlight = true
      const res = await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($task: TaskInput!) {
            upsertTask (task: $task) {
              _id
            }
          }
        `,
        variables: {
          task: data
        },
        refetchQueries: [`allTasks`]
      }))

      if (res.isError) {
        console.log(res)
      }

      this.inFlight = false
      this.saved = true
    },
    onClickRow: function (item) {
      this.$router.push({ path: `/tasks/${item._key}/view` })
    }
  },
  watch: {
  }
}
</script>

<template>
  <v-container>

    <h1 class="mt-7 mb-8">Tasks</h1>

    <v-data-table
      :headers="headers"
      :items="allTasks && allTasks.items"
      class="striped clickable"
      item-key="_key"
      no-data-text="No tasks found."
      :items-per-page.sync="pageSize"
      :server-items-length="allTasks && allTasks.count"
      :page.sync="page"
      :footer-props="{
        'items-per-page-options': pageSizeOptions
      }"
      :loading="$apollo.queries.allTasks.loading"
      @click:row="onClickRow"
    >
      <template v-slot:item.autoRetry="{item}">
        <v-switch hide-details class="ma-0 py-1" @click.stop="updateTask({ _key: item._key, autoRetry: !item.autoRetry })" :input-value="item.autoRetry" />
      </template>
      <template v-slot:item.enabled="{item}">
        <v-switch hide-details class="ma-0 py-1" @click.stop="updateTask({ _key: item._key, enabled: !item.enabled })" :input-value="item.enabled" />
      </template>
    </v-data-table>
  </v-container>
</template>

<style lang="scss" scoped>

h2 {
  margin-bottom: 30px;
}

</style>
