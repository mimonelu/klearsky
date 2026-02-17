import type { AppBskyDraftGetDrafts } from "@atproto/api"

// NOTE: agent.app.bsky.draft.getDrafts() を使用すると
//       レスポンスバリデーションにより draftPost.text が 300 grapheme 以上の
//       下書きで XRPCInvalidResponseError が発生するため、
//       fetchWithoutAgent でバリデーションを回避する
export default async function (
  this: TIAtpWrapper,
  limit?: number,
  cursor?: string
): Promise<Error | AppBskyDraftGetDrafts.Response> {
  const query: AppBskyDraftGetDrafts.QueryParams = {}
  if (limit != null) {
    query.limit = limit
  }
  if (cursor != null) {
    query.cursor = cursor
  }
  const response = await this.fetchWithoutAgent({
    path: "app.bsky.draft.getDrafts",
    did: this.session?.did ?? "",
    query,
    method: "json",
    bearer: true,
  })
  if (response instanceof Error) {
    return response
  }
  return response
}
