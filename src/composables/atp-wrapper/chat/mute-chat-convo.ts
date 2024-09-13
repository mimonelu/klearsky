import type { ChatBskyConvoMuteConvo } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ChatBskyConvoMuteConvo.InputSchema = { convoId }
  const options: ChatBskyConvoMuteConvo.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response: Error | ChatBskyConvoMuteConvo.Response =
    await this.agent.api.chat.bsky.convo.muteConvo(query, options)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.convo.muteConvo]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
