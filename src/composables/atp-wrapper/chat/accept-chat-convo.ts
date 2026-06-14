import type { ChatBskyConvoAcceptConvo } from "@atproto/api"

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
  const query: ChatBskyConvoAcceptConvo.InputSchema = { convoId }
  const options: ChatBskyConvoAcceptConvo.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  const response: Error | ChatBskyConvoAcceptConvo.Response =
    await this.agent.chat.bsky.convo.acceptConvo(query, options)
      .then((value) => value)
      .catch((error) => error)
  $log("chat.bsky.convo.acceptConvo", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
