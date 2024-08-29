import type { AppBskyGraphUnmuteActor, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<boolean> {
  if (this.agent == null) return false
  const response: AppBskyGraphUnmuteActor.Response = await (
    this.agent as AtpAgent
  ).unmute(did)
  console.log("[klearsky/unmute]", response)
  return true
}
