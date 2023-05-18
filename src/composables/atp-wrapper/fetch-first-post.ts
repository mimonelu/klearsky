import type { BskyAgent, ComAtprotoRepoListRecords } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  handle: string
): Promise<undefined | string> {
  if (this.agent == null) return
  const query: ComAtprotoRepoListRecords.QueryParams = {
    collection: "app.bsky.feed.post",
    repo: handle,
    limit: 1,
    reverse: true,
  }
  const response: ComAtprotoRepoListRecords.Response =
    await (this.agent as BskyAgent).api.com.atproto.repo.listRecords(query)
  console.log("[klearsky/listRecords/firstPost]", response)
  if (!response.success || response.data.records == null) return
  return response.data.records[0].uri
}
