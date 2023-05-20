import type { BskyAgent, ComAtprotoLabelQueryLabels } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uriPatterns: Array<string>,
): Promise<undefined | Array<TTLabel>> {
  if (this.agent == null) return
  const query: ComAtprotoLabelQueryLabels.QueryParams = { uriPatterns }
  const response: ComAtprotoLabelQueryLabels.Response =
    await (this.agent as BskyAgent).api.com.atproto.label.queryLabels(query)
  console.log("[klearsky/queryLabels]", response)
  if (!response.success) return
  // TODO: cursor にも対応すること
  return response.data.labels
}
