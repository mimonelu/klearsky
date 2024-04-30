export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<undefined | Error | TTPost> {
  const response = await this.fetchRecords(
    did,
    "app.bsky.feed.post",
    1,
    undefined,
    true
  )
  if (response instanceof Error) {
    return response
  }
  if (response.records == null ||
      response.records[0]?.uri == null) {
    return
  }
  const posts = await this.fetchPosts([response.records[0].uri])
  return posts ? posts[0] : undefined
}
