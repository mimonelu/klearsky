import type { BskyAgent, ChatBskyConvoDeleteMessageForSelf } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string,
  messageId: string
): Promise<Error | boolean> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const headers = { "atproto-proxy": "did:web:api.bsky.chat#bsky_chat" }
  const query: ChatBskyConvoDeleteMessageForSelf.InputSchema = {
    convoId,
    messageId,
  }
  const options: ChatBskyConvoDeleteMessageForSelf.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .deleteMessageForSelf(query, options)
      .then((value: ChatBskyConvoDeleteMessageForSelf.Response) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.deleteMessageForSelf]", response)
  if (response instanceof Error) {
    return response
  }
  return true
}
