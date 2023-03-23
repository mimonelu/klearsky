import storage from "@/composables/storage"

export default async function (
  this: TIAtpWrapper,
  service?: string,
  identifier?: string,
  password?: string
): Promise<boolean> {
  const session = this.data.sessions[this.data.did]
  service ??= session.__service ?? "https://bsky.social"

  if (!this.createAgent(service)) return false
  if (this.agent == null) return false
  if (identifier == null || password == null) {
    if (session == null) return false
    await this.resumeSession(session)
  } else await this.agent.login({ identifier, password })

  // ここで persistSession が入る

  storage.save("atp", this.data)

  return true
}
