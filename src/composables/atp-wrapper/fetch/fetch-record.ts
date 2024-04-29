import type { BskyAgent, ComAtprotoRepoGetRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  repo: string,
  collection: string,
  uri: string,
  cid?: string
): Promise<Error | {
  uri: string
  cid?: string
  value: {}
}> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const rkey = Util.getRkey(uri)
  const query: ComAtprotoRepoGetRecord.QueryParams = {
    repo,
    collection,
    rkey,
  }
  if (cid != null) {
    query.cid = cid
  }
  const response: Error | ComAtprotoRepoGetRecord.Response =
    await (this.agent as BskyAgent).com.atproto.repo.getRecord(query)
      .then((value: ComAtprotoRepoGetRecord.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getRecord]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}
