export default function (
  this: TIAtpWrapper,
  newSession: TTSession,
  service?: string
) {
  this.data.did = newSession.did
  const currentSession = this.data.sessions[this.data.did] ?? {}

  // セッションデータの更新
  currentSession.active = newSession.active ?? currentSession.active ?? true
  currentSession.accessJwt = newSession.accessJwt ?? currentSession.accessJwt
  currentSession.refreshJwt = newSession.refreshJwt ?? currentSession.refreshJwt
  currentSession.did = newSession.did ?? currentSession.did
  currentSession.handle = newSession.handle ?? currentSession.handle
  currentSession.email = newSession.email ?? currentSession.email
  currentSession.emailAuthFactor = newSession.emailAuthFactor ?? currentSession.emailAuthFactor
  currentSession.emailConfirmed = newSession.emailConfirmed ?? currentSession.emailConfirmed

  // プロトコル付きサービスアドレスの更新
  currentSession.__service = service ?? newSession.__service ?? currentSession.__service ?? ""

  // プロトコルなしサービスアドレス（ホスト名）の更新
  let hostName = ""
  if (currentSession.__service != null) {
    try {
      const url = new URL(currentSession.__service)
      hostName = url.hostname
    } catch (error) {
      console.warn(`[klearsky/resetSession] ${error}`)
    }
  }
  currentSession.__serviceName = hostName ?? newSession.__serviceName ?? currentSession.__serviceName ?? ""

  this.data.sessions[this.data.did] = this.session = currentSession
  console.log("[klearsky/resetSession]")
}
