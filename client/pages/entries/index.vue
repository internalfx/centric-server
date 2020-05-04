
<script>
import { mapState, mapActions } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import gql from 'graphql-tag'

import format from '../../../lib/format.js'
import { to } from '../../../lib/utils.js'

import entryStatus from '../../ui/entryStatus.vue'
// import animate from 'velocity-animate'

export default {
  apollo: {
    entries: {
      query: gql`
        query searchEntries ($page: Int, $pageSize: Int, $types: [String]) {
          entries: searchEntries (page: $page, pageSize: $pageSize, types: $types) {
            count
            pageCount
            items {
              _key
              number
              type
              createdAt
              message
              data
            }
          }
        }
      `,
      variables: function () {
        return {
          page: this.page,
          pageSize: this.pageSize,
          types: this.entryTypes
        }
      },
      fetchPolicy: `network-only`
    }
  },
  data: function () {
    return {
      headers: [
        { text: `Entry. #`, align: `left`, sortable: false, value: `number` },
        { text: `Type`, align: `left`, sortable: false, value: `type` },
        { text: `Created At`, align: `left`, sortable: false, value: `createdAt` },
        { text: `Message`, align: `left`, sortable: false, value: `message` },
        { text: `Data`, align: `left`, sortable: false, value: `data` }
      ]
    }
  },
  components: {
    entryStatus
  },
  computed: {
    ...mapState({
      user: state => state.auth.user
    }),
    ...mapFields(`settings`, {
      page: `entries-index.page`,
      pageSize: `entries-index.pageSize`,
      entryTypes: `entries-index.entryTypes`,
      pageSizeOptions: `pageSizeOptions`
    })
  },
  methods: {
    ...format(`dataDisplay`, `truncate`, `dateTimeSeconds`),
    ...mapActions(`dashboard`, [
    ]),
    onClickRow: function (item) {
      this.$router.push({ path: `/entries/${item._key}/view` })
    }
  }
}
</script>

<template>
  <v-container>
    <h2 class="my-2">Warnings and Errors</h2>
    <!-- <v-toolbar class="mb-3">
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
    </v-toolbar> -->

    <v-data-table
      loading-text="Loading... Please wait"
      :headers="headers"
      :items="entries && entries.items"
      class="striped clickable"
      item-key="_key"
      no-data-text="No entries match your search."
      :items-per-page.sync="pageSize"
      :server-items-length="entries && entries.count"
      :page.sync="page"
      :footer-props="{
        'items-per-page-options': pageSizeOptions
      }"
      :loading="$apollo.queries.entries.loading"
      @click:row="onClickRow"
    >
      <template v-slot:item.type="{ item }">
        <entryStatus :value="item.type" />
      </template>
      <template v-slot:item.createdAt="{ item }">
        {{dateTimeSeconds(item.createdAt)}}
      </template>
      <template v-slot:item.message="{ item }">
        <div class="d-block text-truncate">{{ truncate(item.message, 100) }}</div>
      </template>
      <template v-slot:item.data="{ item }">
        <code class="d-block text-truncate">{{ dataDisplay(item.data, 100) }}</code>
      </template>
    </v-data-table>
  </v-container>
</template>

<style lang="scss" scoped>

.fade-enter-active, .fade-leave-active {
  transition: all 0.4s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-move {
  transition: 0.4s;
}

</style>
