type TTPreferenceFeedType = "pinned" | "saved"

type TTPreference =
  TTPreferenceLabel |
  TTPreferenceLabeler |
  TTPreferenceCustomFeedV1 |
  TTPreferenceCustomFeedV2

type TTPreferenceLabel = {
  $type: "app.bsky.actor.defs#contentLabelPref"
  // enabled?: boolean
  label?: string
  labelerDid?: string
  visibility?: TTContentVisibility
}

type TTPreferenceLabeler = {
  $type: "app.bsky.actor.defs#labelersPref"
  labelers?: Array<{ did: string }>
  // labelerDid?: string
}

type TTPreferenceCustomFeedV1 = {
  $type: "app.bsky.actor.defs#savedFeedsPref"
  pinned?: Array<string>
  saved?: Array<string>
}

type TTPreferenceCustomFeedV2 = {
  $type: "app.bsky.actor.defs#savedFeedsPrefV2"
  items?: Array<{
    id?: string
    type?: "timeline" | "feed" | "list"
    value?: string
    pinned?: boolean
  }>
}
