import { state } from "@/composables/main-state"

export default function (this: TIAtpWrapper) {
  // MySession経由でログアウト
  if (state.mySession) {
    state.mySession.logout()
  }
}
