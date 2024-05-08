import type { AppBskyLabelerGetServices, BskyAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  dids: string[],
  detailed?: boolean
): Promise<Error | Array<TILabeler>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: AppBskyLabelerGetServices.QueryParams = { dids }
  if (detailed != null) {
    query.detailed = detailed
  }
  const response: Error | AppBskyLabelerGetServices.Response =
    await (this.agent as BskyAgent).app.bsky.labeler.getServices(query)
      .then((value: AppBskyLabelerGetServices.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/fetchLabels]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.views as unknown as Array<TILabeler>
}
