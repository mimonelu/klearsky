import type { AtpAgent } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  listUri: string
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | TTCidUri =
    await (this.agent as AtpAgent).blockModList(listUri)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/blockModList]", response)
  if (response instanceof Error) {
    return response
  }
  return response.uri
}
