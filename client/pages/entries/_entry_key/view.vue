
<script>
// import _ from 'lodash'

import dataEdit from '../../../ui/dataEdit.vue'
import entryStatus from '../../../ui/entryStatus.vue'
import format from '../../../../lib/format.js'
import { spiderData } from '../../../../lib/utils.js'

import gql from 'graphql-tag'

export default {
  apollo: {
    entry: {
      query: gql`
        query getEntry ($_key: ID!) {
          entry: getEntry (_key: $_key) {
            _key
            _id
            number
            type
            createdAt
            groupName
            message
            data
            operation {
              _key
              number
              status
            }
          }
        }
      `,
      variables: function () {
        return {
          _key: this.$route.params.entry_key
        }
      }
    }
  },
  data: function () {
    return {
    }
  },
  components: {
    // vDisplay,
    dataEdit,
    entryStatus
  },
  props: {
  },
  computed: {
    title: function () {
      if (this.entry) {
        return `Entry ${this.entry.id}`
      }

      return null
    }
  },
  methods: {
    ...format(`dateTimeSeconds`),
    spiderData: spiderData
  }
}
</script>

<template>
  <v-container v-if="entry">
    <v-layout justify-space-between>
      <div class="mb-3">
        <h1 class="mb-0">Entry #{{entry.number}}</h1>
        <nuxt-link :to="{ path: `/operations/${entry.operation._key}/view` }">Operation #{{entry.operation.number}}</nuxt-link>
      </div>
      <entryStatus :value="entry.type" />
    </v-layout>
    <v-layout wrap>
      <v-text-field :value="dateTimeSeconds(entry.createdAt)" label="Time" readonly />
      <v-text-field :value="entry.groupName" label="Group" readonly />
    </v-layout>

    <v-row>
      <v-col cols="12" lg="6">
        <v-card class="pa-3">
          <h2>Message</h2>
          <dataEdit :value="entry.message" :readOnly="true" language="text"/>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card class="pa-3">
          <h2>Data</h2>
          <dataEdit :value="entry.data" :readOnly="true" language="json"/>
        </v-card>
      </v-col>
      <!-- <v-col>
        <v-card class="pa-3">
          <h2>Search Data</h2>
          <dataEdit :value="spiderData(entry.data)" :readOnly="true" language="json"/>
        </v-card>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
