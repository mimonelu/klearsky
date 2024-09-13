import type { AppBskyGraphUnmuteThread } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphUnmuteThread.InputSchema = { root: uri }
  const response: Error | AppBskyGraphUnmuteThread.Response =
    await this.agent.app.bsky.graph.unmuteThread(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/unmuteThread]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
}
