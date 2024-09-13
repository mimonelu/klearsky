import type { AppBskyGraphUnmuteActorList } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyGraphUnmuteActorList.Response =
    await this.agent.unmuteModList(listUri)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/unmuteModList]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
