import type { ChatBskyConvoGetMessages } from "@atproto/api"

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
  const response: Error | ChatBskyConvoGetMessages.Response =
    await this.agent.chat.bsky.convo.getMessages(query, options)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    $warn("chat.bsky.convo.getMessages", response)
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data as { cursor?: string; messages: Array<TIChatMessage> }
}
