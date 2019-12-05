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
      fetchPolicy: 'network-only'
    }
  },
  data: function () {
    return {
      searchVar: '',
      headers: [
        { text: 'Name', value: 'name', sortable: false },
        { text: 'Description', value: 'description', sortable: false },
        { text: 'Auto Retry?', value: 'autoRetry', sortable: false },
        { text: 'Enabled?', value: 'enabled', sortable: false }
        // { text: 'Actions', value: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  components: {
    // vInput,
    // alert
  },
  computed: {
    ...mapFields('settings', {
      page: 'tasks.page',
      pageSize: 'tasks.pageSize',
      search: 'tasks.search'
    }),
    ...mapState('settings', {
      pageSizeOptions: 'pageSizeOptions'
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
        refetchQueries: ['allTasks']
      }))

      if (res.isError) {
        console.log(res)
      }

      this.inFlight = false
      this.saved = true
    },
    onClickRow: function (item) {
      this.$router.push({ path: '/tasks/view', query: { _key: item._key } })
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
      <!-- <template v-slot:item.actions="{item}">
        <v-tooltip top>
          <template v-slot:activator="{on}">
            <span v-on="on">
              <v-btn @click.stop text fab small class="ma-0 mr-2" :to="{ path: '/tasks/edit', query: { _key: item._key } }">
                <v-icon>fas fa-pencil-alt</v-icon>
              </v-btn>
            </span>
          </template>
          <span>Edit</span>
        </v-tooltip>
      </template> -->
    </v-data-table>

    <!-- <v-card>
      <v-simple-table dense>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Auto Retry?</th>
            <th>Enabled?</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task of tasks" :key="task._key">
            <td>
              <router-link :to="{path: '/task/edit', query: {_id: task._id}}">
                {{ task.name }}
              </router-link>
            </td>
            <td>{{ task.description }}</td>
            <td>
              <v-switch hide-details class="ma-0 py-1" @click="updateTask({ _id: task._id, autoRetry: !task.autoRetry })" :input-value="task.autoRetry" />
            </td>
            <td>
              <v-switch hide-details class="ma-0 py-1" @click="updateTask({ _id: task._id, enabled: !task.enabled })" :input-value="task.enabled" />
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card> -->
  </v-container>
</template>

<style lang="scss" scoped>

h2 {
  margin-bottom: 30px;
}

</style>
