import type { BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<boolean> {
  if (this.agent == null) return false
  await (this.agent as BskyAgent).deleteRepost(uri)
  return true
}
