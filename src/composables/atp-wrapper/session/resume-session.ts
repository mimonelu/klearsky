import type { AtpSessionData, BskyAgent, ComAtprotoServerGetSession } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  session: AtpSessionData
): Promise<boolean> {
  if (this.agent == null) return false
  const response: ComAtprotoServerGetSession.Response =
    await (this.agent as BskyAgent).resumeSession({
      accessJwt: session.accessJwt,
      did: session.did,
      email: session.email,
      emailConfirmed: session.emailConfirmed,
      handle: session.handle,
      refreshJwt: session.refreshJwt,
    })
  console.log("[klearsky/resumeSession]", response)
  return response.success
}
