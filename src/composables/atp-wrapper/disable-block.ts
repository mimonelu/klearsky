import type { BskyAgent, ComAtprotoRepoDeleteRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<boolean> {
  if (this.agent == null) return false
  const rkey = (uri.match(/\/([^\/]+)$/) ?? ["", ""])[1]
  const query: Omit<ComAtprotoRepoDeleteRecord.InputSchema, "collection"> = {
    repo: this.session?.did as string,
    rkey,
  }
  await (this.agent as BskyAgent).app.bsky.graph.block.delete(query)
  return true
}
