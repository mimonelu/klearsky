import type { ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  did: string
): Promise<Error | string> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const query = {
    repo: this.session?.did as string,
  }
  const response: Error | ComAtprotoRepoCreateRecord.OutputSchema =
    await this.agent.app.bsky.graph.block.create(query, {
      createdAt: new Date().toISOString(),
      subject: did,
    })
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/block.create]", response)
  if (response instanceof Error) {
    return response
  }
  if (response?.uri == null) {
    return Error("apiError")
  }
  return response.uri
}
