type TTPreferenceFeedType = "pinned" | "saved"

type TTPreference =
  TTPreferenceLabel |
  TTPreferenceLabeler |
  TTPreferenceCustomFeedV1 |
  TTPreferenceCustomFeedV2 |
  TTPreferenceThreadView

type TTPreferenceLabel = {
  $type: "app.bsky.actor.defs#contentLabelPref"
  label?: string
  labelerDid?: string
  visibility?: TTContentVisibility
}

type TTPreferenceLabeler = {
  $type: "app.bsky.actor.defs#labelersPref"
  labelers?: Array<{ did: string }>
}

type TTPreferenceCustomFeedV1 = {
  $type: "app.bsky.actor.defs#savedFeedsPref"
  pinned?: Array<string>
  saved?: Array<string>
}

type TTPreferenceCustomFeedV2 = {
  $type: "app.bsky.actor.defs#savedFeedsPrefV2"
  items?: Array<TTPreferenceCustomFeedV2Item>
}

type TTPreferenceCustomFeedV2Item = {
  id?: string
  type?: "feed" | "list" | "timeline" | THIRD_PARTY_DOMAIN_EXTRA_FEED
  value?: string
  pinned?: boolean
}

type TTPreferenceThreadView = {
  $type: "app.bsky.actor.defs#threadViewPref"
  sort?: "oldest" | "newest" | "most-likes" | "hotness"
}
