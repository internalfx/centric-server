
export default function ({ app, redirect }) {
  if (app.$auth.loggedIn) {
    redirect(`/`)
  }
}
