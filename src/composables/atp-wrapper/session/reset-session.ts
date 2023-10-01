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
  this.data.sessions[this.data.did] = this.session = session
  console.log("[klearsky/resetSession]")
}
