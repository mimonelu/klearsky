import type { AppBskyGraphMuteActor, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<boolean> {
  if (this.agent == null) return false
  const response: AppBskyGraphMuteActor.Response = await (
    this.agent as AtpAgent
  ).mute(did)
  console.log("[klearsky/mute]", response)
  return true
}
