import type { AppBskyActorGetPreferences, BskyAgent } from "@atproto/api"

export default async function (this: TIAtpWrapper): Promise<undefined | Array<TTPreference>> {
  if (this.agent == null) {
    return
  }
  const response: AppBskyActorGetPreferences.Response =
    await (this.agent as BskyAgent).app.bsky.actor.getPreferences()
      .then((value: AppBskyActorGetPreferences.Response) => value)
      .catch((error: any) => error)
  console.log("[klearsky/getPreferences]", response)
  if (response instanceof Error) {
    return
  }
  if (!response.success) {
    return
  }
  if (response.data?.preferences == null) {
    return
  }
  const preference = response.data.preferences as Array<TTPreference>

  // savedFeedsPref がなければ作成
  // TODO: V2 が普及次第撤去すること
  const hasSavedFeedsPref = preference
    .some((preference: TTPreference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
    })
  if (!hasSavedFeedsPref) {
    preference.push({
      $type: "app.bsky.actor.defs#savedFeedsPref",
      pinned: [],
      saved: [],
    })
  }

  /*
  // savedFeedsPrefV2 がなければ作成
  const hasSavedFeedsPrefV2 = preference
    .some((preference: TTPreference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPrefV2"
    })
  if (!hasSavedFeedsPrefV2) {
    preference.push({
      $type: "app.bsky.actor.defs#savedFeedsPrefV2",
      items: [],
    })
  }
  */

  return preference
}
