import type { AppBskyDraftGetDrafts } from "@atproto/api"
import { XRPCInvalidResponseError } from "@atproto/xrpc"

export default async function (
  this: TIAtpWrapper,
  limit?: number,
  cursor?: string
): Promise<Error | AppBskyDraftGetDrafts.OutputSchema> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  const response: Error | AppBskyDraftGetDrafts.OutputSchema =
    await this.agent.app.bsky.draft.getDrafts({ limit, cursor })
      .then((value) => value.data)
      .catch((error) => {
        // NOTE: draftPost.text のレキシコン定義は maxGraphemes: 1000 だが、
        //       @atproto/api のバリデータが post の maxGraphemes: 300 で検証するバグがあり、
        //       300 grapheme 超のテキストを含む下書きで XRPCInvalidResponseError が発生する。
        //       レスポンス自体は正常なため responseBody からデータを取り出す。
        if (error instanceof XRPCInvalidResponseError) {
          return error.responseBody as AppBskyDraftGetDrafts.OutputSchema
        }
        return error instanceof Error ? error : Error(String(error))
      })
  $log("fetchDrafts", response)
  return response
}
