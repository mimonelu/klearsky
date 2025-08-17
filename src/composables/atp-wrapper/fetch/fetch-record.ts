import type { ComAtprotoRepoGetRecord } from "@atproto/api"
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
  const response = await this.fetchWithoutAgent({
    path: "com.atproto.repo.getRecord",
    did: repo,
    query: query as unknown as Record<string, string>,
    method: "json",
  })
  if (response instanceof Error) {
    return response
  }
  return response
}
