import type { ComAtprotoRepoListRecords } from "@atproto/api"

type TTRequest = Omit<ComAtprotoRepoListRecords.QueryParams, 'collection'>

export default async function (
  this: TIAtpWrapper,
  repo: string,
  limit?: number,
  cursor?: string
): Promise<Error | TIFetchChatDeclarationsResponse> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: TTRequest = { repo }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response: Error | TIFetchChatDeclarationsResponse =
    await this.agent.api.chat.bsky.actor.declaration.list(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.actor.declaration.list]", response)
  if (response instanceof Error) {
    return response
  }
  return response
}
