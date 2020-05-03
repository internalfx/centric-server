
<script>
// import _ from 'lodash'
import gql from 'graphql-tag'
import { to, errMsg } from '../../../../../lib/utils.js'
import { mapActions } from 'vuex'
// import { mapFields } from 'vuex-map-fields'

import scheduleForm from '../../../../ui/forms/scheduleForm.vue'

export default {
  apollo: {
  },
  data: function () {
    return {
      inFlight: false,
      schedule: {
        name: null,
        cronTime: null,
        enabled: null,
        taskKey: null,
        data: null
      }
    }
  },
  components: {
    scheduleForm
  },
  computed: {
  },
  methods: {
    ...mapActions([
      `showSnackbar`
    ]),
    save: async function () {
      this.inFlight = true
      const res = await to(this.$apollo.mutate({
        mutation: gql`
          mutation ($schedule: ScheduleInput!) {
            upsertSchedule (schedule: $schedule) {
              _key
              _id
            }
          }
        `,
        variables: {
          schedule: this.schedule
        },
        refetchQueries: []
      }))

      if (res.isError) {
        this.showSnackbar({ message: errMsg(res), color: `error` })
      } else {
        this.showSnackbar({ message: `Schedule saved.`, color: `success` })
        this.$router.go(-1)
      }

      this.inFlight = false
    }
  },
  mounted: function () {
    this.schedule.taskKey = this.$route.params.task_key
  }
}
</script>

<template>
  <v-container>
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>Create Schedule</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
      </v-col>
    </v-row>

    <scheduleForm v-model="schedule" class="mb-3" />

    <v-row>
      <v-col class="d-flex align-center">
        <v-btn x-large color="primary" :loading="inFlight" :disabled="inFlight" @click="save"><v-icon left>fas fa-save</v-icon> Save</v-btn>
        <v-btn class="ml-7" text color="secondary" @click="$router.go(-1)"><v-icon left>fas fa-times</v-icon> Cancel</v-btn>
      </v-col>
      <v-col cols="auto" class="d-flex align-center justify-end">
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
</style>
