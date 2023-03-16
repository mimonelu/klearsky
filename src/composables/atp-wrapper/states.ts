import storage from "@/composables/storage"

export function canLogin(this: AbstractAtpWrapper): boolean {
  return storage.load("handle") != null
}

export function hasLogin(this: AbstractAtpWrapper): boolean {
  return this.session != null
}
