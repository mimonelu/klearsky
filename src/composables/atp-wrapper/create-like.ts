import type { BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string
): Promise<boolean> {
  if (this.agent == null) return false
  const response: TTCidUri = await (this.agent as BskyAgent).like(uri, cid)
  console.log("[klearsky/like]", response)
  return true
}
