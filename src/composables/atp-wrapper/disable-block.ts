import { AtUri } from "@atproto/uri"
import type { ComAtprotoRepoDeleteRecord, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<boolean> {
  if (this.agent == null) return false
  const aturi = new AtUri(uri)
  const query: Omit<ComAtprotoRepoDeleteRecord.InputSchema, "collection"> = {
    repo: this.session?.did as string,
    rkey: aturi.rkey,
  }
  await (this.agent as BskyAgent).app.bsky.graph.block.delete(query)
  return true
}
