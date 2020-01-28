<script>
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import resetPassword from '../ui/resetPassword'

export default {
  data: function () {
    return {
      drawer: false,
      navColor: 'primary',
      showResetDialog: false
    }
  },
  computed: {
    ...mapState({
      user: state => state.auth.user,
      alert: state => state.alert,
      confirm: state => state.confirm
    }),
    ...mapFields({
      snackbarShow: 'snackbar.show',
      snackbarColor: 'snackbar.color',
      snackbarMessage: 'snackbar.message'
    }),
    showAlert: {
      get: function () {
        return this.alert.resolve != null
      },
      set: function (val) {
        this.alert.resolve('close')
      }
    },
    showConfirm: {
      get: function () {
        return this.confirm.resolve != null
      },
      set: function (val) {
      }
    },
    showSnackbar: {
      get: function () {
        return this.snackbar != null
      },
      set: function (value) {

      }
    }
  },
  components: {
    resetPassword
  },
  methods: {
    logout: async function () {
      await this.$auth.logout()
      this.$router.push('/login')
    }
  }
}
</script>

<template>
  <v-app>
    <v-navigation-drawer
      app
      :value="drawer || $vuetify.breakpoint.mdAndUp"
      @input="drawer = $event"
      :temporary="$vuetify.breakpoint.smAndDown"
      clipped
      :mobile-break-point="'sm'"
    >

      <v-list dense class="small-margin">

        <v-list-item :color="navColor" to="/" exact nuxt>
          <v-list-item-action><v-icon>fas fa-chart-line fa-fw</v-icon></v-list-item-action>
          <v-list-item-content><v-list-item-title>Dashboard</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item :color="navColor" to="/tasks" exact nuxt>
          <v-list-item-action><v-icon>fas fa-tasks fa-fw</v-icon></v-list-item-action>
          <v-list-item-content><v-list-item-title>Tasks</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item :color="navColor" to="/history" exact nuxt>
          <v-list-item-action><v-icon>fas fa-history fa-fw</v-icon></v-list-item-action>
          <v-list-item-content><v-list-item-title>History</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item v-if="user.role === 'ADM'" :color="navColor" to="/users" exact nuxt>
          <v-list-item-action><v-icon>fas fa-user fa-fw</v-icon></v-list-item-action>
          <v-list-item-content><v-list-item-title>Users</v-list-item-title></v-list-item-content>
        </v-list-item>

      </v-list>

      <v-list dense>
        <v-divider/>
        <v-list-item :color="navColor" @click="showResetDialog = true">
          <v-list-item-action>
            <v-icon>fas fa-key</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Reset Password</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item :color="navColor" @click="logout">
          <v-list-item-action>
            <v-icon>fas fa-sign-out-alt</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

    </v-navigation-drawer>

    <v-app-bar app clipped-left dark color="secondary">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="$vuetify.breakpoint.smAndDown" />
      <v-toolbar-title @click="$router.push('/')" class="clickable">
        <h2>Centric Server</h2>
      </v-toolbar-title>
    </v-app-bar>

    <v-content class="mb-12">
      <nuxt :key="$route.fullPath"/>
    </v-content>

    <v-dialog v-model="showAlert" max-width="290" persistent>
      <v-card>
        <v-card-title class="headline error lighten-2 white--text" primary-title>
          {{alert.title}}
        </v-card-title>

        <v-card-text>
          {{alert.body}}
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="alert.resolve('ok')">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirm" max-width="350" persistent>
      <v-card>
        <v-card-title class="headline" primary-title>
          {{confirm.title}}
        </v-card-title>

        <v-card-text>
          {{confirm.body}}
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="confirm.resolve('no')">No</v-btn>
          <v-spacer />
          <v-btn color="primary" @click="confirm.resolve('yes')">Yes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <resetPassword v-model="showResetDialog" @closed="showResetDialog = false" />

    <v-snackbar
      v-model="snackbarShow"
      :color="snackbarColor"
      bottom
      multi-line
      :timeout="4000"
    >
      {{ snackbarMessage }}
      <v-btn text @click="snackbarShow = false">
        Close
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<style lang="scss">
  .small-margin .v-list-group__items .v-list-item {
    margin-left: -32px;
  }

  .v-data-table.clickable tbody tr td {
    cursor: pointer;
  }
</style>
