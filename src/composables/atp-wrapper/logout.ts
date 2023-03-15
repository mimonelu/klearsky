import storage from "@/composables/storage"

export default function (this: AbstractAtpWrapper) {
  storage.remove("handle")
  if (this.session != null) {
    storage.remove(this.session.handle)
    this.session = null
  }
}
