import type { AppBskyGraphUnmuteActorList, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<undefined | Error> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: AppBskyGraphUnmuteActorList.Response | Error =
    await (this.agent as AtpAgent).unmuteModList(listUri)
      .then((value: AppBskyGraphUnmuteActorList.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/unmuteModList]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
}
