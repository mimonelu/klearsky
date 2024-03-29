import type { BskyAgent, ComAtprotoIdentityResolveHandle } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  handle: string
): Promise<Error | string> {
  if (this.agent == null) return Error("noAgentError")
  const query: ComAtprotoIdentityResolveHandle.QueryParams = { handle }
  const response: Error | ComAtprotoIdentityResolveHandle.Response =
    await (this.agent as BskyAgent).resolveHandle(query)
      .then((value: ComAtprotoIdentityResolveHandle.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/resolveHandle]", response)
  if (response instanceof Error) return response
  if (!response.success) return Error("apiError")
  return response.data.did
}
