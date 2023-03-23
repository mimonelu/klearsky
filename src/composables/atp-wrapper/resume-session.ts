import type { AtpSessionData, ComAtprotoSessionGet } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  session: AtpSessionData
): Promise<boolean> {
  if (this.agent == null) return false
  const response: ComAtprotoSessionGet.Response =
    await this.agent.resumeSession(session)
  console.log("[klearsky/resumeSession]", response)
  return response.success
}
