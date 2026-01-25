import { state } from "@/composables/main-state"

export default function (this: TIAtpWrapper, did?: string) {
  // MySession経由でアカウント削除
  if (state.mySession) {
    const targetDid = did ?? state.mySession.did
    state.mySession.removeAccount(targetDid)
  }
}
