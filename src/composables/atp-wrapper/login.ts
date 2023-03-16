import storage from "@/composables/storage"

export default async function (
  this: AbstractAtpWrapper,
  service?: string,
  identifier?: string,
  password?: string
): Promise<boolean> {
  this.setService(service)
  if (!this.createAgent()) return false
  if (this.agent == null) return false
  try {
    if (identifier == null || password == null)
      await this.resumeSession(identifier ?? undefined)
    else await this.agent.login({ identifier, password })
  } catch (error: any) {
    console.error("[klearsky/login]", error)
    this.logout()
    return false
  }
  // ここで persistSession が入る
  if (this.session == null) return false
  const handle: string = this.session.handle

  this.accounts = storage.load("accounts") ?? this.accounts
  if (this.accounts == null) this.accounts = {}
  if (this.accounts[handle] == null)
    this.accounts[handle] = {
      service: this.service ?? "",
      handle,
    }
  storage.save("accounts", this.accounts)

  storage.save("handle", handle)
  storage.save(handle, this.session)
  return true
}
