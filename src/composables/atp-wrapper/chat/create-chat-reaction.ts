import type { ChatBskyConvoAddReaction } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  convoId: string,
  messageId: string,
  value: string
): Promise<Error | TIChatMessage> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ChatBskyConvoAddReaction.InputSchema = {
    convoId,
    messageId,
    value,
  }
  const options: ChatBskyConvoAddReaction.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  const response: Error | ChatBskyConvoAddReaction.Response =
    await this.agent.chat.bsky.convo.addReaction(query, options)
      .then((value) => value)
      .catch((error) => error)
  $log("chat.bsky.convo.addReaction", response)
  if (response instanceof Error) {
    return response
  }
  if (
    !response.success ||
    response.data?.message == null
  ) {
    return Error("apiError")
  }
  return response.data.message as TIChatMessage
}
