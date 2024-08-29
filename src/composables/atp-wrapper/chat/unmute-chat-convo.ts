import type { AtpAgent, ChatBskyConvoUnmuteConvo } from "@atproto/api"

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
  const query: ChatBskyConvoUnmuteConvo.InputSchema = { convoId }
  const options: ChatBskyConvoUnmuteConvo.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response = await (this.agent as AtpAgent).api.chat.bsky.convo
    .unmuteConvo(query, options)
      .then((value: ChatBskyConvoUnmuteConvo.Response) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.unmuteConvo]", response)
  if (response instanceof Error) {
    return response
  }
  return true
}
