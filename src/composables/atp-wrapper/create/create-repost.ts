import type { ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | ComAtprotoRepoCreateRecord.OutputSchema =
    await this.agent.repost(uri, cid)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/repost]", response)
  if (response instanceof Error) {
    return response
  }
}
