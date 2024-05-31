import type { BskyAgent, ChatBskyConvoGetLog } from "@atproto/api"

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
  if (options.headers != null && this.proxies.chat != null) {
    options.headers["atproto-proxy"] = this.proxies.chat
  }
  const response = await (this.agent as BskyAgent).api.chat.bsky.convo
    .getLog(query, options)
      .then((value: ChatBskyConvoGetLog.Response) => value)
      .catch((error: Error) => error)
  if (response instanceof Error) {
    console.warn("[klearsky/api.chat.bsky.convo.getLog]", response)
    return response
  }
  return response.data.logs as unknown as Array<TIChatLog>
}
