
<script>
import { mapState, mapActions } from 'vuex'
import gql from 'graphql-tag'

import format from '../../../lib/format.js'
import { to } from '../../../lib/utils.js'

import operationStatus from '../../ui/operationStatus.vue'
import animate from 'velocity-animate'

export default {
  apollo: {
    operations: {
      query: gql`
        query currentOperations {
          operations: currentOperations {
            _key
            number
            status
            nextRunDate
            task {
              _key
              name
            }
            entries (pageSize: 3) {
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
      `,
      fetchPolicy: `no-cache`,
      pollInterval: 1000
    }
  },
  data: function () {
    return {
      headers: [
        { text: `Op. #`, align: `left`, sortable: false },
        { text: `Name`, align: `left`, sortable: false },
        { text: `Status`, align: `left`, sortable: false },
        { text: `Run Date`, align: `left`, sortable: false },
        { text: `Entries`, align: `left`, sortable: false }
      ],
      syncBus: null
    }
  },
  components: {
    operationStatus
  },
  computed: {
    ...mapState({
      user: state => state.auth.user
    }),
    truncateSize: function () {
      switch (this.$vuetify.breakpoint.name) {
        case `xs`: return 20
        case `sm`: return 30
        case `md`: return 35
        case `lg`: return 38
        case `xl`: return 50
      }

      return null
    }
  },
  methods: {
    ...format(`dataDisplay`, `truncate`, `dateTimeSeconds`),
    ...mapActions(`dashboard`, [
    ]),
    chipStyle: function (status) {
      if (status === `waiting`) {
        return {
          icon: `fas fa-fw fa-clock`,
          color: `gray`,
          textColor: `black`,
          outline: true
        }
      } else if (status === `active`) {
        return {
          icon: `fas fa-fw fa-spin fa-spinner`,
          color: `indigo`,
          textColor: `white`,
          outline: false
        }
      } else if (status === `failed`) {
        return {
          icon: `fas fa-fw fa-exclamation-circle`,
          color: `warning`,
          textColor: `white`,
          outline: false
        }
      } else if (status === `completed`) {
        return {
          icon: `fas fa-fw fa-check-circle`,
          color: `success`,
          textColor: `white`,
          outline: false
        }
      } else {
        return {
          icon: `fas fa-fw fa-circle`,
          color: `gray`,
          textColor: `black`,
          outline: true
        }
      }
    },
    cancelOperation: async function (operation) {
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
          _key: operation._key
        }
      }))
    },
    restartOperation: async function (operation) {
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
          _key: operation._key
        }
      }))
    },
    beforeEnter: function (el) {
      el.style.opacity = 0
    },
    enter: function (el, done) {
      var delay = el.dataset.index * 100 + 250
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
  }
}
</script>

<template>
  <v-container v-if="operations">
    <h1 class="my-7">Dashboard</h1>
    <h2 class="my-2">Current Operations</h2>
    <transition name="fade">
      <div v-if="operations && operations.length === 0">
        <v-card outlined class="pa-12">
          <v-card-text><h3>There are no current operations.</h3></v-card-text>
        </v-card>
      </div>
    </transition>
    <transition-group name="fade">
      <div v-for="operation of operations" :key="operation._key">
        <v-card class="pa-3 mb-3">

          <div class="d-flex justify-space-between align-center">
            <h1><nuxt-link :to="{ path: `/operations/${operation._key}/view` }"># {{operation.number}}</nuxt-link></h1>
            <h2>{{operation.task.name}}</h2>
            <span>
              <v-btn rounded color="error" v-if="['active', 'failed', 'waiting'].includes(operation.status)" @click="cancelOperation(operation)">
                <v-icon left>fas fa-sm fa-times-circle</v-icon> Cancel
              </v-btn>
              <v-btn rounded color="info" v-if="['cancelled', 'terminated', 'failed'].includes(operation.status)" @click="restartOperation(operation)">
                <v-icon left>fas fa-sm fa-redo</v-icon> Restart
              </v-btn>
            </span>
          </div>

          <v-row>
            <v-col col="12" md="4" lg="3" xl="2">
              <operationStatus :value="operation.status" />
              <div class="my-3">
                <h4>Next run date:</h4>
                {{dateTimeSeconds(operation.nextRunDate)}}
              </div>
            </v-col>
            <v-col col="12" md="8" lg="9" xl="10" style="height: 130px; overflow: hidden;">
              <h3>Recent Entries</h3>
              <transition-group
                name="fadefast"
                v-bind:css="false"
                v-on:before-enter="beforeEnter"
                v-on:enter="enter"
                v-on:leave="leave"
              >
                <div v-for="(entry, index) of operation.entries.items" :key="entry._key" v-bind:data-index="index">
                  <v-row class="ma-0 pa-0">
                    <v-col col="6" class="text-truncate ma-0 pa-0">
                      {{entry.message}}
                    </v-col>
                    <v-col col="6" class="text-truncate ma-0 pa-0">
                      <code style="padding: 2px;" class="d-block text-truncate mb-2">{{entry.data}}</code>
                    </v-col>
                  </v-row>
                </div>
              </transition-group>
            </v-col>
          </v-row>
        </v-card>
      </div>
    </transition-group>
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
