import type { AtpSessionData, BskyAgent, ComAtprotoServerGetSession } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  session: AtpSessionData
): Promise<Error | ComAtprotoServerGetSession.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | ComAtprotoServerGetSession.Response =
    await (this.agent as BskyAgent).resumeSession({
      accessJwt: session.accessJwt,
      did: session.did,
      email: session.email,
      emailConfirmed: session.emailConfirmed,
      handle: session.handle,
      refreshJwt: session.refreshJwt,
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
