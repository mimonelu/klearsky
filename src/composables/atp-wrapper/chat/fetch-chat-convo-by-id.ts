import type { ChatBskyConvoGetConvo } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string
): Promise<Error | TIChatConvo> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ChatBskyConvoGetConvo.QueryParams = { convoId }
  const options: ChatBskyConvoGetConvo.CallOptions = { headers: {} }
  const response: Error | ChatBskyConvoGetConvo.Response =
    await this.agent.chat.bsky.convo.getConvo(query, options)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    $warn("chat.bsky.convo.getConvo", response)
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.convo as unknown as TIChatConvo
}
