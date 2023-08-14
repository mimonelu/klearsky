import type { AppBskyUnspeccedApplyLabels, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  labels: Array<TTLabel>,
): Promise<Error | boolean> {
  if (this.agent == null) return Error("no agent")
  const query: AppBskyUnspeccedApplyLabels.InputSchema = { labels }
  const response: AppBskyUnspeccedApplyLabels.Response =
    await (this.agent as BskyAgent).app.bsky.unspecced.applyLabels(query)
      .then((value: AppBskyUnspeccedApplyLabels.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/applyLabels]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("failed")
  return true
}
