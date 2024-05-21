import type { BskyAgent, ChatBskyConvoMuteConvo } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string
): Promise<Error | boolean> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const query: ChatBskyConvoMuteConvo.InputSchema = { convoId }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .muteConvo(query, {
      headers,
      encoding: "application/json",
    })
      .then((value: ChatBskyConvoMuteConvo.Response) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.muteConvo]", response)
  if (response instanceof Error) {
    return response
  }
  return true
}
