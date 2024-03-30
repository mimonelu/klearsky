import type { AppBskyActorGetPreferences, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<undefined | Array<TTPreference>> {
  if (this.agent == null) return
  const response: AppBskyActorGetPreferences.Response =
    await (this.agent as BskyAgent).app.bsky.actor.getPreferences()
      .then((value: AppBskyActorGetPreferences.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPreferences]", response)
  if (response instanceof Error) return
  if (!response.success) return
  if (response.data?.preferences == null) return
  const preference = response.data.preferences as Array<TTPreference>

  // フィードプリファレンスがなければ作成
  const hasFeedPreferences = preference.some((preference: TTPreference) => {
    return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
  })
  if (!hasFeedPreferences) {
    preference.push({
      $type: "app.bsky.actor.defs#savedFeedsPref",
      pinned: [],
      saved: [],
    })
  }

  return preference
}
