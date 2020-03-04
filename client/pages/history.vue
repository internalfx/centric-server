
<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
// import { mapFields, mapMultiRowFields } from 'vuex-map-fields'
import format from '../../lib/format.js'
import operationStatus from '../ui/operationStatus.vue'

import gql from 'graphql-tag'

export default {
  apollo: {
    operations: {
      query: gql`
        query searchOperations ($page: Int, $pageSize: Int, $search: String, $taskKeys: [ID]) {
          operations: searchOperations (page: $page, pageSize: $pageSize, search: $search, taskKeys: $taskKeys) {
            count
            pageCount
            items {
              _key
              number
              status
              nextRunDate
              task {
                _key
                name
              }
              entries (pageSize: 1) {
                count
                pageCount
                items {
                  _key
                  message
                  data
                }
              }
            }
          }
        }
      `,
      variables: function () {
        return {
          page: this.page,
          pageSize: this.pageSize,
          search: this.currentSearch,
          taskKeys: this.taskKeys
        }
      },
      fetchPolicy: 'network-only'
    },
    tasksAutocomplete: {
      query: gql`
        query tasksAutocomplete (
          $task_keys: [ID!]
          $search: String
        ) {
          tasksAutocomplete: tasksAutocomplete (
            task_keys: $task_keys
            search: $search
          ) {
            _key
            name
          }
        }
      `,
      variables: function () {
        return {
          task_keys: this.taskKeys,
          search: this.currentSearch
        }
      },
      fetchPolicy: 'no-cache'
    }

  },
  data: function () {
    return {
      headers: [
        { text: 'Operation #', align: 'left', sortable: false, value: 'number' },
        { text: 'Task Name', align: 'left', sortable: false, value: 'task.name' },
        { text: 'Status', align: 'left', sortable: false, value: 'status' },
        { text: 'Run Date', align: 'left', sortable: false, value: 'nextRunDate' },
        { text: 'Entry Count', align: 'left', sortable: false, value: 'entries.count' },
        { text: 'Last Entry Message', align: 'left', sortable: false, value: 'entries' },
        { text: 'Last Entry Data', align: 'left', sortable: false, value: 'entries.items' }
      ],
      syncBus: null,
      taskKeys: [],
      currentTaskSearch: ''
    }
  },
  components: {
    operationStatus
  },
  computed: {
    ...mapState('dashboard', [
    ]),
    ...mapFields('settings', {
      page: 'history.page',
      pageSize: 'history.pageSize',
      taskKey: 'history.taskKey',
      search: 'history.search',
      pageSizeOptions: 'pageSizeOptions'
    }),
    tasksList: function () {
      const tasks = this.tasks || []

      return [
        { _key: null, name: 'Any Task' },
        ...tasks
      ]
    },
    currentSearch: {
      get: function () {
        return this.search
      },
      set: function (newValue) {
        newValue = newValue || ''
        this.search = newValue.toLowerCase()
      }
    }
  },
  methods: {
    get: _.get,
    ...format('dataDisplay', 'truncate', 'dateTimeSeconds'),
    onClickRow: function (item) {
      this.$router.push({ path: `/operations/${item._key}/view` })
    }
  },
  mounted: function () {
    this.currentSearch = this.search
  },
  watch: {
    taskId: _.debounce(function (val) {
      this.page = 1
    }, 500, { maxWait: 1000 }),
    search: _.debounce(function (val) {
      this.currentSearch = val
      this.page = 1
    }, 500, { maxWait: 1000 })
  }
}
</script>

<template>
  <v-container>
    <h2 class="my-2">Search Operations</h2>
    <v-toolbar class="mb-3">
      <v-autocomplete
        v-model="taskKeys"
        :items="tasksAutocomplete"
        :search-input.sync="currentTaskSearch"
        :loading="$apollo.queries.tasksAutocomplete.loading"
        label="Filter by task"
        item-text="name"
        item-value="_key"
        hide-details
        multiple
        clearable
        @click:clear.stop="taskKey = null"
        solo
        flat
      />
      <v-spacer />
      <v-text-field
        v-model="currentSearch"
        hide-details
        prepend-icon="fas fa-search"
        placeholder="Search"
        solo
        flat
        clearable
      />
    </v-toolbar>

    <!-- <v-pagination class="my-3" v-if="operations.pageCount > 1" v-model="page" :length="operations.pageCount" /> -->

    <v-data-table
      loading-text="Loading... Please wait"
      :headers="headers"
      :items="operations && operations.items"
      class="striped clickable"
      item-key="_key"
      no-data-text="No operations match your search."
      :items-per-page.sync="pageSize"
      :server-items-length="operations && operations.count"
      :page.sync="page"
      :footer-props="{
        'items-per-page-options': pageSizeOptions
      }"
      :loading="$apollo.queries.operations.loading"
      @click:row="onClickRow"
    >
      <template v-slot:item.status="{ item }">
        <operationStatus :value="item.status" />
      </template>
      <template v-slot:item.nextRunDate="{ item }">
        {{dateTimeSeconds(item.nextRunDate)}}
      </template>
      <template v-slot:item.entries="{ item }">
        <div v-for="entry of item.entries.items" :key="entry._key">
          {{truncate(entry.message, 20)}}
        </div>
      </template>
      <template v-slot:item.entries.items="{ item }">
        <div v-for="entry of item.entries.items" :key="entry._key">
          <code style="margin-left: 5px; padding: 2px; white-space: inherit;">
            {{truncate(entry.data, 20)}}
          </code>
        </div>
      </template>
    </v-data-table>

    <!-- <v-pagination class="my-3" v-if="operations.pageCount > 1" v-model="page" :length="operations.pageCount" /> -->
  </v-container>
</template>

<style lang="scss">
</style>
