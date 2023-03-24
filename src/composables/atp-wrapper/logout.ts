import storage from "@/composables/storage"

export default function (this: TIAtpWrapper, did?: string) {
  // ログイン中のアカウントのログアウト
  if (this.data.did === did || did == null) {
    delete this.data.sessions[this.data.did]
    this.data.did = ""
    storage.save("atp", this.data)
    this.session = undefined

  // ログインしていない他のアカウントの削除
  } else {
    delete this.data.sessions[did]
    storage.save("atp", this.data)
  }
}
