import storage from "@/composables/storage"

export default function (this: AbstractAtpWrapper, service?: string) {
  this.service = service ?? storage.load("service") ?? "https://bsky.social"
  storage.save("service", this.service)
}
