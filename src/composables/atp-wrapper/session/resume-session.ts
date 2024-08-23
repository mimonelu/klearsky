import type { AtpSessionData, AtpAgent, ComAtprotoServerGetSession } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  session: AtpSessionData
): Promise<Error | ComAtprotoServerGetSession.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | ComAtprotoServerGetSession.Response =
    await (this.agent as AtpAgent).resumeSession({
      active: true,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      did: session.did,
      email: session.email,
      emailAuthFactor: session.emailAuthFactor,
      emailConfirmed: session.emailConfirmed,
      handle: session.handle,
    })
      .then((value: ComAtprotoServerGetSession.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/resumeSession]", response)
  if (response instanceof Error) {
    return Error("resumeSessionError")
  }
  if (!response.success) {
    return Error("resumeSessionError")
  }
  return response.data
}
