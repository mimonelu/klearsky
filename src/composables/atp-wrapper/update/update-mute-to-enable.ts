import type { AppBskyGraphMuteActor, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyGraphMuteActor.Response =
    await (this.agent as AtpAgent).mute(did)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/mute]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
