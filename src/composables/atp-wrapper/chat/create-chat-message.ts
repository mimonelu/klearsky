import type { BskyAgent, ChatBskyConvoSendMessage } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string,
  text: string
): Promise<Error | TIChatMessage> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const query: ChatBskyConvoSendMessage.InputSchema = {
    convoId,
    message: {
      text,
    },
  }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .sendMessage(query, {
      headers,
      encoding: "application/json",
    })
      .then((value: ChatBskyConvoSendMessage.Response) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.sendMessage]", response)
  if (response instanceof Error) {
    return response
  }
  return response.data
}
