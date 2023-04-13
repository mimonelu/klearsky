import storage from "@/composables/storage"

export default function (this: TIAtpWrapper) {
  this.data.did = ""
  storage.save("atp", this.data)
  this.session = undefined
}
