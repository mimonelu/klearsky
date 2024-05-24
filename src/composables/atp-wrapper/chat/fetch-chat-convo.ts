import type { BskyAgent, ChatBskyConvoGetConvoForMembers } from "@atproto/api"

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
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .getConvoForMembers(query, options)
      .then((value: ChatBskyConvoGetConvoForMembers.Response) => value)
      .catch((error: Error) => error)
  console.log("[klearsky/api.chat.bsky.convo.getConvoForMembers]", response)
  if (response instanceof Error) {
    return response
  }
  return response.data.convo as unknown as TIChatConvo
}
