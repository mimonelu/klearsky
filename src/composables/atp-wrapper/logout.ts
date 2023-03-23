import storage from "@/composables/storage"

export default function (this: TIAtpWrapper) {
  delete this.data.sessions[this.data.did]
  this.data.did = ""
  storage.save("atp", this.data)
  this.session = undefined
}
