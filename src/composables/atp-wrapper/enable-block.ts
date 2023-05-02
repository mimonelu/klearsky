import type { ComAtprotoRepoCreateRecord, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  handle: string
): Promise<null | string> {
  if (this.agent == null) return null
  const query: Omit<ComAtprotoRepoCreateRecord.InputSchema, "collection" | "record"> = {
    repo: this.session?.did as string,
  }
  const response: {
    uri: string;
    cid: string;
  } = await (
    this.agent as BskyAgent
  ).app.bsky.graph.block.create(query, {
    createdAt: new Date().toISOString(),
    subject: handle,
  })
  console.log("[klearsky/block.create]", response)
  if (response?.uri == null) return null
  return response.uri
}
