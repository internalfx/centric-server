<script>
// // import axios from 'axios'
// import _ from 'lodash'

// import vInput from '../ui/vInput.vue'
// import alert from '../ui/alert.vue'
import dataEdit from '../../../ui/dataEdit.vue'

import operationStatus from '../../../ui/operationStatus.vue'
import entryStatus from '../../../ui/entryStatus.vue'
// import opStatusBadge from '../ui/opStatusBadge.vue'
// import entryDialog from '../dialogs/entryDialog.vue'
// import { setTimeout, clearTimeout } from 'timers';
// import { log } from 'util';
import format from '../../../../lib/format.js'
import gql from 'graphql-tag'
import { to } from '../../../../lib/utils.js'

import animate from 'velocity-animate'

export default {
  apollo: {
    operation: {
      query: gql`
        query getOperation ($_key: ID!, $entryPage: Int, $entryTypes: [String]) {
          operation: getOperation (_key: $_key) {
            _key
            _id
            number
            status
            data
            result
            nextRunDate
            prevOperationKey
            nextOperationKey
            task {
              _key
              _id
              name
            }
            entries (page: $entryPage, pageSize: 10, types: $entryTypes) {
              count
              pageCount
              items {
                _key
                _id
                type
                createdAt
                groupName
                message
                data
              }
            }
          }
        }
      `,
      variables: function () {
        return {
          _key: this.$route.params.operation_key,
          entryPage: this.page,
          entryTypes: this.filterLogTypes
        }
      },
      fetchPolicy: `no-cache`,
      pollInterval: 1000
    }
  },
  data: function () {
    return {
      page: 1,
      inFlight: false,
      error: null,
      timeout: null,
      dialogEntry: null,
      headers: [
        { text: `Time`, align: `left`, sortable: false },
        { text: `Type`, align: `left`, sortable: false },
        { text: `Message`, align: `left`, sortable: false },
        { text: `Data`, align: `left`, sortable: false }
      ],
      logTypes: [`info`, `warning`, `error`],
      filterLogTypes: [`info`, `warning`, `error`]
    }
  },
  components: {
    dataEdit,
    operationStatus,
    entryStatus
  },
  computed: {
    truncateSize () {
      switch (this.$vuetify.breakpoint.name) {
        case `xs`: return 20
        case `sm`: return 60
        case `md`: return 28
        case `lg`: return 38
        case `xl`: return 50
      }

      return null
    }
  },
  methods: {
    cancelOperation: async function () {
      await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($_key: ID!) {
            cancelOperation (_key: $_key) {
              _key
              status
            }
          }
        `,
        variables: {
          _key: this.operation._key
        }
      }))
    },
    restartOperation: async function () {
      await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($_key: ID!) {
            restartOperation (_key: $_key) {
              _key
              status
            }
          }
        `,
        variables: {
          _key: this.operation._key
        }
      }))
    },
    ...format(`dateTimeSeconds`, `dataDisplay`, `truncate`),
    getStyle: function (status) {
      if (status === `warning`) {
        return { 'background-color': `hsl(55, 88%, 92%)` }
      } else if (status === `error`) {
        return { 'background-color': `hsl(0, 85%, 90%)` }
      }
    },
    beforeEnter: function (el) {
      el.style.opacity = 0
    },
    enter: function (el, done) {
      var delay = el.dataset.index * 30 + 220
      setTimeout(function () {
        animate(
          el,
          { opacity: 1 },
          { duration: 200, complete: done }
        )
      }, delay)
    },
    leave: function (el, done) {
      animate(
        el,
        { opacity: 0 },
        { duration: 200, complete: done }
      )
    }
  },
  mounted: function () {
    this.page = 1
    this.filterLogTypes = [`info`, `warning`, `error`]
  }
}
</script>

<template>
  <div v-if="operation && operation.task">
    <v-container>
      <v-layout class="mb-3" align-center justify-space-between>
        <v-btn :disabled="!operation.prevOperationKey" rounded :to="{ path: `/operations/${operation.prevOperationKey}/view` }">
          <v-icon class="mr-2">fas fa-angle-left</v-icon> Previous
        </v-btn>
        <v-btn :disabled="!operation.nextOperationKey" rounded :to="{ path: `/operations/${operation.nextOperationKey}/view` }">
          Next <v-icon class="ml-2">fas fa-angle-right</v-icon>
        </v-btn>
      </v-layout>

      <div class="d-flex justify-space-between align-center mb-3">
        <h1>Operation #{{operation.number}}</h1>
        <div class="d-flex align-center ml-3" style="flex-grow: 1;">
          <v-btn rounded color="error" v-if="['active', 'failed', 'waiting'].includes(operation.status)" @click="cancelOperation">
            <v-icon left>fas fa-sm fa-times-circle</v-icon> Cancel
          </v-btn>
          <v-btn rounded color="info" v-if="['cancelled', 'terminated', 'failed'].includes(operation.status)" @click="restartOperation">
            <v-icon left>fas fa-sm fa-redo</v-icon> Restart
          </v-btn>
        </div>
        <operationStatus :value="operation.status" />
      </div>

      <v-card class="pa-3 mb-3">
        <div class="d-flex justify-space-between align-center">
          <h2>{{operation.task.name}}</h2>
          <div class="my-3">
            <h4 style="display: inline-block;">Next run date:</h4>
            {{dateTimeSeconds(operation.nextRunDate)}}
          </div>
        </div>
      </v-card>

      <h2 class="mb-3">Log Entries</h2>
      <v-select
        :items="logTypes"
        v-model="filterLogTypes"
        label="Visible entry types"
        multiple
        outlined
      ></v-select>

      <v-pagination class="mb-3" v-if="operation.entries.pageCount > 1" v-model="page" :length="operation.entries.pageCount" />

      <transition-group
        name="fadefast"
        v-bind:css="false"
        v-on:before-enter="beforeEnter"
        v-on:enter="enter"
        v-on:leave="leave"
      >
        <div v-for="(entry, index) of operation.entries.items" :key="entry._key" v-bind:data-index="index">
          <v-card class="pa-2 mb-1" :to="{ path: `/entries/${entry._key}/view` }">
             <v-row>
              <v-col cols="3" sm="2" lg="1" class="my-0 py-0">
                <entryStatus :value="entry.type" compact />
              </v-col>
              <v-col cols="9" sm="5" lg="2" class="my-1 py-0">
                <div class="d-block text-truncate">{{ dateTimeSeconds(entry.createdAt) }}</div>
              </v-col>
              <v-col cols="12" sm="5" lg="2" class="my-1 py-0">
                <div class="d-block text-truncate">{{ truncate(entry.groupName, 100) }}</div>
              </v-col>
              <v-col cols="12" sm="6" lg="3" class="my-1 py-0">
                <div class="d-block text-truncate">{{ truncate(entry.message, 100) }}</div>
              </v-col>
              <v-col cols="12" sm="6" lg="4" class="my-1 py-0">
                <code class="d-block text-truncate">{{ dataDisplay(entry.data, 100) }}</code>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </transition-group>

      <v-pagination class="my-3" v-if="operation.entries.pageCount > 1" v-model="page" :length="operation.entries.pageCount" />

      <div class="i-grid gap-3 my-3" :class="{'cols-2': this.$vuetify.breakpoint.mdAndUp}">
        <div>
          <v-card class="pa-3">
            <h2>Current Operation Data</h2>
            <dataEdit :value="operation.data" :readOnly="true"/>
          </v-card>
        </div>
        <div>
          <v-card class="pa-3">
            <h2>Operation Result</h2>
            <dataEdit :value="operation.result" :readOnly="true"/>
          </v-card>
        </div>
      </div>

    </v-container>
  </div>
</template>

<style lang="scss" scoped>

.fadefast-move {
  transition: 0.3s;
}

</style>
