import type { AppBskyGraphUnmuteActor } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyGraphUnmuteActor.Response =
    await this.agent.unmute(did)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/unmute]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
