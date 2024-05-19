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
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo.listConvos(query, { headers })
    .then((value: ChatBskyConvoListConvos.Response) => value)
    .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.listConvos]", response)
  if (response instanceof Error) {
    return response
  }
  return response.data as unknown as TIFetchChatConvosResponse
}
