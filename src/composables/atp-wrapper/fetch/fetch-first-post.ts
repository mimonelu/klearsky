import type { BskyAgent, ComAtprotoRepoListRecords } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<undefined | string> {
  // TODO: PDS分割に伴う暫定処置
  const query: Record<string, string> = {
    collection: "app.bsky.feed.post",
    repo: did,
    limit: "1",
    reverse: "true",
  }
  const params = new URLSearchParams(query)
  const url = `https://bsky.social/xrpc/com.atproto.repo.listRecords?${params}`
  const response: Response = await fetch(url)
    .catch((error: any) => console.error("[klearsky/listRecords/firstPost]", error))
    .then((value: any) => value)
  if (!response.ok) return
  const data = await response.json()
  if (data?.records == null) return
  return data.records[0]?.uri

  /*
  if (this.agent == null) return
  const query: ComAtprotoRepoListRecords.QueryParams = {
    collection: "app.bsky.feed.post",
    repo: did,
    limit: 1,
    reverse: true,
  }
  const response: ComAtprotoRepoListRecords.Response =
    await (this.agent as BskyAgent).api.com.atproto.repo.listRecords(query)
  console.log("[klearsky/listRecords/firstPost]", response)
  if (!response.success || response.data.records == null) return
  return response.data.records[0]?.uri
  */
}
