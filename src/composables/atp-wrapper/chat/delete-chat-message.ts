import type { ChatBskyConvoDeleteMessageForSelf } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string,
  messageId: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
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
  const response: Error | ChatBskyConvoDeleteMessageForSelf.Response =
    await this.agent.api.chat.bsky.convo.deleteMessageForSelf(query, options)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.convo.deleteMessageForSelf]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
