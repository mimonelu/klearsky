import type { BskyAgent, ChatBskyConvoGetMessages } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string,
  limit?: number,
  cursor?: string
): Promise<Error | { cursor?: string; messages: Array<TIChatMessage> }> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ChatBskyConvoGetMessages.QueryParams = { convoId }
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const options: ChatBskyConvoGetMessages.CallOptions = { headers: {} }
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo.getMessages(query, options)
    .then((value: ChatBskyConvoGetMessages.Response) => value)
    .catch((error: Error) => error)
  if (response instanceof Error) {
    console.warn("[klearsky/api.chat.bsky.convo.getMessages]", response)
    return response
  }
  return response.data as { cursor?: string; messages: Array<TIChatMessage> }
}
