import type { ChatBskyConvoRemoveReaction } from "@atproto/api"

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
  const query: ChatBskyConvoRemoveReaction.InputSchema = {
    convoId,
    messageId,
    value,
  }
  const options: ChatBskyConvoRemoveReaction.CallOptions = {
    headers: {},
    encoding: "application/json",
  }
  const response: Error | ChatBskyConvoRemoveReaction.Response =
    await this.agent.chat.bsky.convo.removeReaction(query, options)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/chat.bsky.convo.removeReaction]", response)
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
