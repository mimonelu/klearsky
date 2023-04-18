import type { BskyAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string
): Promise<boolean> {
  if (this.agent == null) return false
  const response: ComAtprotoRepoCreateRecord.OutputSchema = await (
    this.agent as BskyAgent
  ).repost(uri, cid)
  console.log("[klearsky/repost]", response)
  return true
}
