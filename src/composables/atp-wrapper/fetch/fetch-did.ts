import type { ComAtprotoIdentityResolveHandle } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  handle: string
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query: ComAtprotoIdentityResolveHandle.QueryParams = { handle }
  const response: Error | ComAtprotoIdentityResolveHandle.Response =
    await this.agent.resolveHandle(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/resolveHandle]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.did
}
