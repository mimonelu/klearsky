import type { BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string
): Promise<undefined | string> {
  if (this.agent == null) return undefined
  const response: TTCidUri = await (this.agent as BskyAgent).like(uri, cid)
  console.log("[klearsky/like]", response)
  return response?.uri ?? undefined
}
