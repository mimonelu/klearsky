import type { ChatBskyConvoGetConvoForMembers } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  members: Array<string>
): Promise<Error | TIChatConvo> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ChatBskyConvoGetConvoForMembers.QueryParams = { members }
  const options: ChatBskyConvoGetConvoForMembers.CallOptions = { headers: {} }
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response: Error | ChatBskyConvoGetConvoForMembers.Response =
    await this.agent.api.chat.bsky.convo.getConvoForMembers(query, options)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/api.chat.bsky.convo.getConvoForMembers]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.convo as unknown as TIChatConvo
}
