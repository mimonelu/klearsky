export default function (preferences: Array<TTPreference>) {
  /*
  // savedFeedsPrefV1 がなければ作成
  const hasSavedFeedsPrefV1 = preferences
    .some((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
    })
  if (!hasSavedFeedsPrefV1) {
    preferences.push({
      $type: "app.bsky.actor.defs#savedFeedsPref",
      pinned: [],
      saved: [],
    })
  }

  // savedFeedsPrefV1 の重複する保存されたフィードとピン留めされたフィードを丸める
  const savedFeedsPrefV1 = preferences
    .find((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
    }) as TTPreferenceCustomFeedV1
  if (savedFeedsPrefV1 != null) {
    if (savedFeedsPrefV1.pinned != null) {
      savedFeedsPrefV1.pinned = Array.from(new Set(savedFeedsPrefV1.pinned))
    }
    if (savedFeedsPrefV1.saved != null) {
      savedFeedsPrefV1.saved = Array.from(new Set(savedFeedsPrefV1.saved))
    }
  }
  */

  // savedFeedsPrefV2 がなければ作成
  const hasSavedFeedsPrefV2 = preferences
    .some((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPrefV2"
    })
  if (!hasSavedFeedsPrefV2) {
    preferences.push({
      $type: "app.bsky.actor.defs#savedFeedsPrefV2",
      items: [],
    })
  }

  // savedFeedsPrefV2 の重複するフィードを丸める
  const savedFeedsPrefV2 = preferences
    .find((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPrefV2"
    }) as undefined | TTPreferenceCustomFeedV2
  if (savedFeedsPrefV2 != null) {
    if (savedFeedsPrefV2.items != null) {
      savedFeedsPrefV2.items = Array.from(new Set(savedFeedsPrefV2.items))
    }
  }
}
