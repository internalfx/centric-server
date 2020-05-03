
<script>
import _ from 'lodash'
import gql from 'graphql-tag'
import { to, errMsg } from '../../../../lib/utils.js'
import format from '../../../../lib/format.js'
import { mapState, mapActions } from 'vuex'
// import { mapFields } from 'vuex-map-fields'

export default {
  apollo: {
    taskRecord: {
      query: gql`
        query getTask (
          $_key: ID!

        ) {
          taskRecord: getTask (_key: $_key) {
            _key
            _id
            name
            description
            enabled
            valid
            autoRetry
            data
            createdAt
            updatedAt

            schedules {
              _key
              _id
              name
              cronTime
              enabled
            }

            triggers {
              _key
              _id
              name
              slug
              enabled
            }
          }
        }
      `,
      variables: function () {
        return {
          _key: this.$route.params.task_key
        }
      },
      fetchPolicy: `no-cache`
    }
  },
  data: function () {
    return {
      schedulePage: 1,
      schedulePageSize: 10,
      scheduleHeaders: [
        { text: `Name`, value: `name`, sortable: false },
        { text: `Cron Time`, value: `cronTime`, sortable: false },
        { text: `Enabled?`, value: `enabled`, sortable: false },
        { text: `Actions`, value: `actions`, sortable: false, align: `right` }
      ],

      triggerPage: 1,
      triggerPageSize: 10,
      triggerHeaders: [
        { text: `Name`, value: `name`, sortable: false },
        { text: `API URL`, value: `slug`, sortable: false },
        { text: `Enabled?`, value: `enabled`, sortable: false },
        { text: `Actions`, value: `actions`, sortable: false, align: `right` }
      ]
    }
  },
  components: {
  },
  computed: {
    ...mapState({
      user: state => state.auth.user
    }),
    ...mapState(`settings`, {
      pageSizeOptions: `pageSizeOptions`
    })
  },
  methods: {
    ...format(`dateTime`, `friendlyCronTime`),
    ...mapActions([
      `showSnackbar`,
      `showConfirm`
    ]),
    updateTask: async function (data) {
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
        refetchQueries: [`getTask`]
      }))

      if (res.isError) {
        console.log(res)
      }
    },
    runSchedule: async function (item) {
      const res = await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($_key: ID!) {
            runScheduleNow (_key: $_key) {
              _key
            }
          }
        `,
        variables: {
          _key: item._key
        }
      }))
      const operation = _.get(res, `data.runScheduleNow`)
      this.$router.push({ path: `/operations/${operation._key}/view` })
    },
    destroySchedule: async function (item) {
      this.inFlight = true

      const choice = await this.showConfirm({
        title: `Are you sure?`,
        body: `This schedule will be deleted!`
      })

      if (choice === `yes`) {
        const res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroySchedule (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: item._key
          },
          refetchQueries: [`getTask`]
        }))

        if (res.isError) {
          this.showSnackbar({ message: errMsg(res), color: `error` })
        } else {
          this.showSnackbar({ message: `Schedule deleted.`, color: `success` })
        }
      }

      this.inFlight = false
    },
    destroyTrigger: async function (item) {
      this.inFlight = true

      const choice = await this.showConfirm({
        title: `Are you sure?`,
        body: `This trigger will be deleted!`
      })

      if (choice === `yes`) {
        const res = await to(this.$apollo.mutate({
          mutation: gql`
            mutation ($_key: ID!) {
              destroyTrigger (_key: $_key) {
                _key
              }
            }
          `,
          variables: {
            _key: item._key
          },
          refetchQueries: [`getTask`]
        }))

        if (res.isError) {
          this.showSnackbar({ message: errMsg(res), color: `error` })
        } else {
          this.showSnackbar({ message: `Trigger deleted.`, color: `success` })
        }
      }

      this.inFlight = false
    },
    scheduleOnClickRow: function (item) {
      this.$router.push({ path: `/tasks/${this.$route.params.task_key}/schedules/${item._key}/edit` })
    },
    triggerOnClickRow: function (item) {
      this.$router.push({ path: `/tasks/${this.$route.params.task_key}/triggers/${item._key}/edit` })
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
        <h1>View Task</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
      </v-col>
    </v-row>

    <div v-if="taskRecord">
      <v-card class="pa-3">
        <v-row class="mb-3">
          <v-col cols="12" sm="6" md="4">
            <v-simple-table>
              <tbody>
                <tr>
                  <td>Name:</td>
                  <td>{{taskRecord.name}}</td>
                </tr>
                <tr>
                  <td>Description:</td>
                  <td>{{taskRecord.description}}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-simple-table>
              <tbody>
                <tr>
                  <td>Enabled:</td>
                  <td><v-switch hide-details class="ma-0 py-1" @click.stop="updateTask({ _key: taskRecord._key, enabled: !taskRecord.enabled })" :input-value="taskRecord.enabled" /></td>
                </tr>
                <tr>
                  <td>Auto Retry:</td>
                  <td><v-switch hide-details class="ma-0 py-1" @click.stop="updateTask({ _key: taskRecord._key, autoRetry: !taskRecord.autoRetry })" :input-value="taskRecord.autoRetry" /></td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-simple-table>
              <tbody>
                <tr>
                  <td>createdAt:</td>
                  <td>{{dateTime(taskRecord.createdAt)}}</td>
                </tr>
                <tr>
                  <td>updatedAt:</td>
                  <td>{{dateTime(taskRecord.updatedAt)}}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <v-row>
      <v-col cols="12" xl="6">
        <v-row class="mt-12 align-center">
          <v-col class="d-flex">
            <h2>Schedules</h2>
          </v-col>
          <v-col cols="auto" class="d-flex justify-end">
            <v-btn color="primary" :to="{ path: `/tasks/${this.$route.params.task_key}/schedules/create` }" rounded><v-icon left>fas fa-plus</v-icon> Create Schedule</v-btn>
          </v-col>
        </v-row>

        <v-data-table
          :headers="scheduleHeaders"
          :items="taskRecord && taskRecord.schedules"
          class="striped"
          item-key="_key"
          no-data-text="No schedules found."
          :items-per-page.sync="schedulePageSize"
          :server-items-length="taskRecord && taskRecord.schedules.count"
          :page.sync="schedulePage"
          :footer-props="{
            'items-per-page-options': pageSizeOptions
          }"
          :loading="$apollo.queries.taskRecord.loading"
        >
          <!-- <template v-slot:item.autoRetry="{item}">
            <v-switch hide-details class="ma-0 py-1" @click.stop="updateTask({ _key: item._key, autoRetry: !item.autoRetry })" :input-value="item.autoRetry" />
          </template> -->
          <template v-slot:item.name="{item}">
            <nuxt-link :to="`/tasks/${$route.params.task_key}/schedules/${item._key}/edit`">{{item.name}}</nuxt-link>
          </template>
          <template v-slot:item.cronTime="{item}">
            <code>{{item.cronTime}}</code> ({{friendlyCronTime(item.cronTime)}})
          </template>
          <template v-slot:item.actions="{item}">
            <v-tooltip top>
              <template v-slot:activator="{on}">
                <span v-on="on">
                  <v-btn @click.stop text fab small class="ma-0" @click="runSchedule(item)">
                    <v-icon>fas fa-cogs</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>Run Schedule Now</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{on}">
                <span v-on="on">
                  <v-btn @click.stop text fab small color="error" class="ma-0" @click="destroySchedule(item)">
                    <v-icon>fas fa-trash-alt</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>
      <v-col cols="12" xl="6">
        <v-row class="mt-12 align-center">
          <v-col class="d-flex">
            <h2>Triggers</h2>
          </v-col>
          <v-col cols="auto" class="d-flex justify-end">
            <v-btn color="primary" :to="{ path: `/tasks/${this.$route.params.task_key}/triggers/create` }" rounded><v-icon left>fas fa-plus</v-icon> Create Trigger</v-btn>
          </v-col>
        </v-row>

        <v-data-table
          v-if="taskRecord"
          :headers="triggerHeaders"
          :items="taskRecord && taskRecord.triggers"
          class="striped"
          item-key="_key"
          no-data-text="No triggers found."
          :items-per-page.sync="triggerPageSize"
          :server-items-length="taskRecord && taskRecord.triggers.count"
          :page.sync="triggerPage"
          :footer-props="{
            'items-per-page-options': pageSizeOptions
          }"
          :loading="$apollo.queries.taskRecord.loading"
        >
          <template v-slot:item.name="{item}">
            <nuxt-link :to="`/tasks/${$route.params.task_key}/triggers/${item._key}/edit`">{{item.name}}</nuxt-link>
          </template>
          <template v-slot:item.slug="{item}">
            <code @click.stop>/api/t/{{item.slug}}</code>
          </template>
          <template v-slot:item.active="{item}">
            <yesNoWidget :value="item.active" />
          </template>
          <template v-slot:item.actions="{item}">
            <v-tooltip top>
              <template v-slot:activator="{on}">
                <span v-on="on">
                  <v-btn @click.stop text fab small color="error" class="ma-0" @click="destroyTrigger(item)">
                    <v-icon>fas fa-trash-alt</v-icon>
                  </v-btn>
                </span>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
