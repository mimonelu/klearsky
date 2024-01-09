export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<undefined | string> {
  const query: Record<string, string> = {
    collection: "app.bsky.feed.post",
    repo: did,
    limit: "1",
    reverse: "true",
  }

  // TODO: PDS分割に伴う暫定処置
  const response = await this.fetchWithoutAgent("com.atproto.repo.listRecords", did, query)

  if (response == null) return
  const data = await response.json()
  if (data?.records == null) return
  return data.records[0]?.uri
}
