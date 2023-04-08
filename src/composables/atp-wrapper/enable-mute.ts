import type { AppBskyGraphMuteActor, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  handle: string
): Promise<boolean> {
  if (this.agent == null) return false
  const response: AppBskyGraphMuteActor.Response =
    await (this.agent as BskyAgent).mute(handle)
  console.log("[klearsky/mute]", response)
  return true
}
