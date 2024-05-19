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
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo.getMessages(query, { headers })
    .then((value: ChatBskyConvoGetMessages.Response) => value)
    .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.getMessages]", response)
  if (response instanceof Error) {
    return response
  }
  return response.data as { cursor?: string; messages: Array<TIChatMessage> }
}
