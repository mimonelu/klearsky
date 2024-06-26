import type { BskyAgent, ChatBskyConvoListConvos } from "@atproto/api"

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
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .listConvos(query, options)
      .then((value: ChatBskyConvoListConvos.Response) => value)
      .catch((error: Error) => error)
  if (response instanceof Error) {
    console.warn("[klearsky/api.chat.bsky.convo.listConvos]", response)
    return response
  }
  return response.data as unknown as TIFetchChatConvosResponse
}
