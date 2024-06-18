import type { AppBskyGraphUnmuteThread, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string
): Promise<Error | boolean> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyGraphUnmuteThread.InputSchema = { root: uri }
  const response: Error | AppBskyGraphUnmuteThread.Response =
    await (this.agent as BskyAgent).app.bsky.graph.unmuteThread(query)
      .then((value: AppBskyGraphUnmuteThread.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/unmuteThread]", response)
  if (response instanceof Error) {
    return response
  }
  return response.success
}
