import type { ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri: string,
  cid: string,
  via?: TTCidUri // repost-via-repost
): Promise<Error | undefined> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | ComAtprotoRepoCreateRecord.OutputSchema =
    await this.agent.repost(uri, cid, via)
      .then((value) => value)
      .catch((error) => error)
  $log("repost", response)
  if (response instanceof Error) {
    return response
  }
}
