import type { ComAtprotoTempFetchLabels } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  since?: number,
  limit?: number
): Promise<Error | Array<TTLabel>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: ComAtprotoTempFetchLabels.QueryParams = {}
  if (since != null) {
    query.since = since
  }
  if (limit != null) {
    query.limit = limit
  }
  const response: Error | ComAtprotoTempFetchLabels.Response =
    await this.agent.api.com.atproto.temp.fetchLabels(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/fetchLabels]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.labels
}
