import { ComAtprotoRepoGetRecord } from "@atproto/api"

// おすすめアルゴリズムへの表示を拒否しているかどうかを返す
// レコードが存在しない場合は、レキシコンの定めに従い `false` を返す
export default async function (
  this: TIAtpWrapper
): Promise<Error | boolean> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const query: ComAtprotoRepoGetRecord.QueryParams = {
    repo: this.session.did,
    collection: "app.bsky.actor.contentVisibilityDeclaration",
    rkey: "self",
  }
  const response: Error | ComAtprotoRepoGetRecord.Response =
    await this.agent.com.atproto.repo.getRecord(query)
      .then((value) => value)
      .catch((error) => error)
  $log("fetchContentVisibilityDeclaration", response)
  if (response instanceof ComAtprotoRepoGetRecord.RecordNotFoundError) {
    return false
  }
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data.value.hideFromAlgorithmicRecommendations === true
}
