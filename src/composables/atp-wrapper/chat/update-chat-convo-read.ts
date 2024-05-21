import type { BskyAgent, ChatBskyConvoUpdateRead } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string,
  messageId?: string
): Promise<Error | TIChatConvo> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const query: ChatBskyConvoUpdateRead.InputSchema = {
    convoId,
    messageId,
  }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .updateRead(query, {
      headers,
      encoding: "application/json",
    })
      .then((value: ChatBskyConvoUpdateRead.Response) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.updateRead]", response)
  if (response instanceof Error) {
    return response
  }
  return response.data.convo as unknown as TIChatConvo
}
