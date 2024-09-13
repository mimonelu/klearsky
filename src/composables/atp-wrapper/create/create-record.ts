import type { ComAtprotoRepoCreateRecord } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  repo: string,
  collection: string,
  record: { [k: string]: any },
  rkey?: string,
  validate?: boolean,
  swapCommit?: string
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoCreateRecord.InputSchema = {
    repo,
    collection,
    rkey,
    validate,
    record,
    swapCommit,
  }
  const response: Error | ComAtprotoRepoCreateRecord.Response =
    await this.agent.com.atproto.repo.createRecord(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/createRecord]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}
