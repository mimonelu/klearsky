import type { BskyAgent, AtpAgentLoginOpts, ComAtprotoServerCreateSession } from "@atproto/api"
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
  } else {
    const optinos: AtpAgentLoginOpts = {
      identifier,
      password,
    }
    const response: ComAtprotoServerCreateSession.Response =
      await (this.agent as BskyAgent).login(optinos)
    console.log("[klearsky/login]", response)
  }

  // ここで persistSession が入る

  storage.save("atp", this.data)
  return true
}
