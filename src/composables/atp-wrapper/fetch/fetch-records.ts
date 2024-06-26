import type { ComAtprotoRepoListRecords } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  repo: string,
  collection: string,
  limit?: number,
  cursor?: string,
  reverse?: boolean
): Promise<Error | {
  cursor?: string
  records: TICommonRecord[]
}> {
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoListRecords.QueryParams = {
    repo,
    collection,
  }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  if (reverse != null) {
    query.reverse = reverse
  }
  const response: Error | Response =
    await this.fetchWithoutAgent(
      "com.atproto.repo.listRecords",
      repo,
      query as unknown as Record<string, string>
    )
  if (response instanceof Error) {
    return response
  }
  const json = await response.json()
  console.log("[klearsky/fetchRecords", json)
  return json
}
