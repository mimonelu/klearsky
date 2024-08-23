import type { AppBskyGraphMuteActorList, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<undefined | Error> {
  if (this.agent == null) return Error("noAgentError")
  const response: AppBskyGraphMuteActorList.Response | Error =
    await (this.agent as AtpAgent).muteModList(listUri)
      .then((value: AppBskyGraphMuteActorList.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/muteModList]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
}
