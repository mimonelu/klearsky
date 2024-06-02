export default function (preferences: Array<TTPreference>) {
  // savedFeedsPref がなければ作成
  // TODO: V2 が普及次第撤去すること
  const hasSavedFeedsPref = preferences
    .some((preference: TTPreference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
    })
  if (!hasSavedFeedsPref) {
    preferences.push({
      $type: "app.bsky.actor.defs#savedFeedsPref",
      pinned: [],
      saved: [],
    })
  }

  /*
  // savedFeedsPrefV2 がなければ作成
  const hasSavedFeedsPrefV2 = preferences
    .some((preference: TTPreference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPrefV2"
    })
  if (!hasSavedFeedsPrefV2) {
    preferences.push({
      $type: "app.bsky.actor.defs#savedFeedsPrefV2",
      items: [],
    })
  }
  */

  preferences.forEach((preference) => {
    // 重複する保存されたフィードとピン留めされたフィードを丸める
    if (preference.$type === "app.bsky.actor.defs#savedFeedsPref") {
      if (preference.pinned != null) {
        preference.pinned = Array.from(new Set(preference.pinned))
      }
      if (preference.saved != null) {
        preference.saved = Array.from(new Set(preference.saved))
      }
    }
  })
}
