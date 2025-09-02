import type { ChatBskyConvoListConvos } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  limit?: number,
  cursor?: string
): Promise<Error | TIFetchChatConvosResponse> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ChatBskyConvoListConvos.QueryParams = {}
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const options: ChatBskyConvoListConvos.CallOptions = { headers: {} }
  const response: Error | ChatBskyConvoListConvos.Response =
    await this.agent.chat.bsky.convo.listConvos(query, options)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    console.warn("[klearsky/chat.bsky.convo.listConvos]", response)
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data as unknown as TIFetchChatConvosResponse
}
