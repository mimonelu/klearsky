import type { AppBskyGraphUnmuteActor, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  handle: string
): Promise<boolean> {
  if (this.agent == null) return false
  const response: AppBskyGraphUnmuteActor.Response =
    await (this.agent as BskyAgent).unmute(handle)
  console.log("[klearsky/unmute]", response)
  return true
}
