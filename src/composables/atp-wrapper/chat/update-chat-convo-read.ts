import type { ChatBskyConvoUpdateRead } from "@atproto/api"

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
  const query: ChatBskyConvoUpdateRead.InputSchema = {
    convoId,
    messageId,
  }
  const options: ChatBskyConvoUpdateRead.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response: Error | ChatBskyConvoUpdateRead.Response =
    await this.agent.api.chat.bsky.convo.updateRead(query, options)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.convo.updateRead]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.convo as unknown as TIChatConvo
}
