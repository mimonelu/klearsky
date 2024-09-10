import Util from "@/composables/util"

export default function (this: TIAtpWrapper, did?: string) {
  // ログイン中のアカウント
  if (did == null) {
    delete this.data.sessions[this.data.did]

  // ログインしていない他のアカウント
  } else {
    delete this.data.sessions[did]
  }

  Util.saveStorage("atp", this.data)
}
