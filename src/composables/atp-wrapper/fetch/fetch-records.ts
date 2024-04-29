import type { BskyAgent, ComAtprotoRepoListRecords } from "@atproto/api"

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
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoListRecords.QueryParams = {
    repo,
    collection,
    limit,
    cursor,
    reverse,
  }
  const response: Error | ComAtprotoRepoListRecords.Response =
    await (this.agent as BskyAgent).com.atproto.repo.listRecords(query)
      .then((value: ComAtprotoRepoListRecords.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/listRecords]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}
