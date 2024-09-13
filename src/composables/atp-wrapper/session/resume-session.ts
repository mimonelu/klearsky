import type { ComAtprotoServerGetSession } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  session: TTSession
): Promise<Error | ComAtprotoServerGetSession.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (session.accessJwt == null ||
      session.refreshJwt == null) {
    return Error("noJwtError")
  }
  const response: Error | ComAtprotoServerGetSession.Response =
    await this.agent.resumeSession({
      active: true,
      accessJwt: session.accessJwt,
      refreshJwt: session.refreshJwt,
      did: session.did,
      email: session.email,
      emailAuthFactor: session.emailAuthFactor,
      emailConfirmed: session.emailConfirmed,
      handle: session.handle,
      status: session.status,
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/resumeSession]", response)
  if (response instanceof Error) {
    return Error("resumeSessionError")
  }
  if (!response.success) {
    return Error("resumeSessionError")
  }
  return response.data
}
