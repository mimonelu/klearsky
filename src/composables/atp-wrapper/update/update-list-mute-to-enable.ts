import type { AppBskyGraphMuteActorList } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyGraphMuteActorList.Response =
    await this.agent.muteModList(listUri)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/muteModList]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
