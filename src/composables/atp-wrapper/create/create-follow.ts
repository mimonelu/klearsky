import type { ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  declarationDid: string
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | ComAtprotoRepoCreateRecord.OutputSchema =
    await this.agent.follow(declarationDid)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/follow]", response)
  if (response instanceof Error) {
    return response
  }
  return response.uri
}
