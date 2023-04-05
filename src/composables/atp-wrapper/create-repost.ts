import type { BskyAgent, ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  post?: TTPost
): Promise<boolean> {
  if (this.agent == null) return false
  const response: ComAtprotoRepoCreateRecord.OutputSchema =
    await (this.agent as BskyAgent).repost(post?.uri as string, post?.cid as string)
  console.log("[klearsky/repost]", response)
  return true
}
