import type { ComAtprotoRepoPutRecord } from "@atproto/api"
import Util from "@/composables/util"

export default async function (
  this: TIAtpWrapper,
  repo: string,
  collection: string,
  uri: string,
  record: { [k: string]: any },
  validate?: boolean,
  swapCommit?: string,
  swapRecord?: string
): Promise<Error | TTCidUri> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const rkey = Util.getRkey(uri)
  const query: ComAtprotoRepoPutRecord.InputSchema = {
    repo,
    collection,
    rkey,
    validate,
    record,
    swapRecord,
    swapCommit,
  }
  const response: Error | ComAtprotoRepoPutRecord.Response =
    await this.agent.com.atproto.repo.putRecord(query)
      .then((value) => value)
      .catch((error) => error)
  console.log("[klearsky/putRecord]", response)
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}
