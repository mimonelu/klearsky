import type { ChatBskyConvoGetLog } from "@atproto/api"

interface TIChatLog {
  rev: string
  convoId: string
  message?: TIChatMessage
}

export default async function (
  this: TIAtpWrapper,
  cursor?: string
): Promise<Error | Array<TIChatLog>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ChatBskyConvoGetLog.QueryParams = {}
  if (cursor != null) {
    query.cursor = cursor
  }
  const options: ChatBskyConvoGetLog.CallOptions = { headers: {} }
  const response: Error | ChatBskyConvoGetLog.Response =
    await this.agent.chat.bsky.convo.getLog(query, options)
      .then((value) => value)
      .catch((error) => error)
  if (response instanceof Error) {
    console.warn("[klearsky/chat.bsky.convo.getLog]", response)
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.logs as unknown as Array<TIChatLog>
}
