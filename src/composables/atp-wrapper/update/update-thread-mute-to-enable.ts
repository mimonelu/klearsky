import type { AppBskyGraphMuteThread } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphMuteThread.InputSchema = { root: uri }
  const response: Error | AppBskyGraphMuteThread.Response =
    await this.agent.app.bsky.graph.muteThread(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/muteThread]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
