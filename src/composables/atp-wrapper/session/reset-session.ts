export default function (
  this: TIAtpWrapper,
  newSession: TTSession,
  service?: string
) {
  this.data.did = newSession.did
  const session = this.data.sessions[this.data.did] ?? {}
  session.accessJwt = newSession.accessJwt ?? session.accessJwt
  session.did = newSession.did ?? session.did
  session.handle = newSession.handle ?? session.handle
  session.email = newSession.email ?? session.email
  session.emailConfirmed = newSession.emailConfirmed ?? session.emailConfirmed
  session.refreshJwt = newSession.refreshJwt ?? session.refreshJwt
  session.__service = service ?? newSession.__service ?? session.__service ?? ""

  // __serviceName の取得
  let hostName = ""
  if (session.__service != null) {
    try {
      const url = new URL(session.__service)
      hostName = url.hostname
    } catch (error) {
      console.error(`[klearsky/__serviceName] ${error}`)
    }
  }
  session.__serviceName = hostName ?? newSession.__serviceName ?? session.__serviceName ?? ""

  // Sandbox フラグ
  session.__sandbox = session.__serviceName !== "bsky.social"

  this.data.sessions[this.data.did] = this.session = session
  console.log("[klearsky/resetSession]")
}
