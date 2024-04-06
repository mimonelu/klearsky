import type { AppBskyActorGetProfiles, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  actors: string[]
): Promise<Error | TTProfile[]> {
  if (this.agent == null) return Error("noAgentError")
  const response: Error | AppBskyActorGetProfiles.Response =
    await (this.agent as BskyAgent).getProfiles({ actors })
      .then((value: AppBskyActorGetProfiles.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getProfiles]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data.profiles as TTProfile[]
}
