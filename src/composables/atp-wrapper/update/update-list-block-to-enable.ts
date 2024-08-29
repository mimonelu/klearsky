import type { AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<string | Error> {
  if (this.agent == null) return Error("noAgentError")
  const response: TTCidUri | Error =
    await (this.agent as AtpAgent).blockModList(listUri)
      .then((value: TTCidUri) => value)
      .catch((error: any) => error)
  console.log("[klearsky/blockModList]", response)
  if (response instanceof Error) return response
  return response.uri
}
