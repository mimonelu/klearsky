import { ComAtprotoRepoGetRecord } from "@atproto/api"
import Util from "@/composables/util"

// Postgate レコードが存在しない場合は `undefined` を返す
// NOTICE: `agent.app.bsky.feed.postgate.get` は `RecordNotFoundError` に変換しないため、`getRecord` を直接使う
export default async function (
  this: TIAtpWrapper,
  post: string
): Promise<Error | undefined | {
  uri: string
  cid?: string
  value: TIPostgate
}> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoGetRecord.QueryParams = {
    repo: this.session.did,
    collection: "app.bsky.feed.postgate",
    rkey: Util.getRkey(post),
  }
  const response: Error | ComAtprotoRepoGetRecord.Response =
    await this.agent.com.atproto.repo.getRecord(query)
      .then((value) => value)
      .catch((error) => error)
  $log("fetchPostgate", response)
  if (response instanceof ComAtprotoRepoGetRecord.RecordNotFoundError) {
    return
  }
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return {
    uri: response.data.uri,
    cid: response.data.cid,
    value: response.data.value as unknown as TIPostgate,
  }
}
