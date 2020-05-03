
<script>
import _ from 'lodash'
import gql from 'graphql-tag'
import { to, errMsg } from '../../../../../../lib/utils.js'
import { mapActions } from 'vuex'
// import { mapFields } from 'vuex-map-fields'

import triggerForm from '../../../../../ui/forms/triggerForm.vue'

export default {
  apollo: {
    record: {
      query: gql`
        query getTrigger ($_key: ID!) {
          record: getTrigger (_key: $_key) {
            _key
            name
            slug
            enabled
            taskKey
          }
        }
      `,
      variables: function () {
        return {
          _key: this.$route.params.trigger_key
        }
      },
      result: function (res) {
        this.trigger = _.omit(res.data.record, `__typename`)
      },
      fetchPolicy: `no-cache`
    }
  },
  data: function () {
    return {
      inFlight: false,
      trigger: null
    }
  },
  components: {
    triggerForm
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
          mutation ($trigger: TriggerInput!) {
            upsertTrigger (trigger: $trigger) {
              _key
              _id
            }
          }
        `,
        variables: {
          trigger: this.trigger
        },
        refetchQueries: []
      }))

      if (res.isError) {
        this.showSnackbar({ message: errMsg(res), color: `error` })
      } else {
        this.showSnackbar({ message: `Trigger saved.`, color: `success` })
        this.$router.go(-1)
      }

      this.inFlight = false
    }
  }
}
</script>

<template>
  <v-container v-if="trigger">
    <v-row class="mt-6 mb-7 align-center">
      <v-col class="d-flex">
        <h1>Edit Trigger</h1>
      </v-col>
      <v-col cols="auto" class="d-flex justify-end">
      </v-col>
    </v-row>

    <triggerForm v-model="trigger" class="mb-3" />

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
