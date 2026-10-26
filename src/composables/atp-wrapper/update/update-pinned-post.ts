import type { AppBskyActorProfile } from "@atproto/api"

export default async function (
  this: TIAtpWrapper,
  uri?: string,
  cid?: string
): Promise<Error | boolean> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  let pinned = false
  const response: Error | undefined =
    await this.agent.upsertProfile((existing?: any): AppBskyActorProfile.Record => {
      // プロフィールレコード未作成時
      if (existing == null) {
        return uri != null && cid != null
          ? { $type: "app.bsky.actor.profile", pinnedPost: { uri, cid } }
          : { $type: "app.bsky.actor.profile" }
      }

      // 固定ポストフィールドの作成／変更
      if (uri != null) {
        pinned = true
        existing.pinnedPost = { uri, cid }

      // 固定ポストフィールドの削除
      } else {
        pinned = false
        delete existing.pinnedPost
      }

      return existing
    })
      .then((value) => value)
      .catch((error) => error)
  $log("upsertProfile", response)
  if (response instanceof Error) {
    return response
  }
  return pinned
}
