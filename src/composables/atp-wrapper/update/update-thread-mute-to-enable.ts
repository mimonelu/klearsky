import type { AppBskyGraphMuteThread, AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | boolean> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphMuteThread.InputSchema = { root: uri }
  const response: Error | AppBskyGraphMuteThread.Response =
    await (this.agent as AtpAgent).app.bsky.graph.muteThread(query)
      .then((value: AppBskyGraphMuteThread.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/muteThread]", response)
  if (response instanceof Error) {
    return response
  }
  return response.success
}
