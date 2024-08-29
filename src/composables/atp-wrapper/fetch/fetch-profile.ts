import type { AppBskyActorGetProfile, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  actor: string
): Promise<Error | TTProfile> {
  if (this.agent == null) return Error("noAgentError")
  const response: Error | AppBskyActorGetProfile.Response =
    await (this.agent as AtpAgent).getProfile({ actor })
      .then((value: AppBskyActorGetProfile.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getProfile]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data as TTProfile
}
