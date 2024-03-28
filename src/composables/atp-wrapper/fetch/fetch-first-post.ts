export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<undefined | Error | TTPost> {
  const query: Record<string, string> = {
    collection: "app.bsky.feed.post",
    repo: did,
    limit: "1",
    reverse: "true",
  }
  const response: undefined | Response | Error =
    await this.fetchWithoutAgent("com.atproto.repo.listRecords", did, query)
  if (response instanceof Error) return response
  if (response == null) return
  const data = await response.json()
  if (data?.records == null || data.records[0]?.uri == null) return
  const posts = await this.fetchPosts([data.records[0].uri])
  return posts ? posts[0] : undefined
}
