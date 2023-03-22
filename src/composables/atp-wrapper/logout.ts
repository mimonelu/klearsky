import storage from "@/composables/storage"

export default function (this: TIAtpWrapper) {
  storage.remove("handle")
  if (this.session != null) {
    this.session = null
  }
}
