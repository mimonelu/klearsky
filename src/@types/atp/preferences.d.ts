type TTPreferenceFeedType = "pinned" | "saved"

type TTPreference = {
  $type: string

  // ラベル
  enabled?: boolean
  label?: string
  visibility?: TTContentVisibility

  // ラベラー
  labelers?: Array<{ did: string }>
  labelerDid?: string

  // カスタムフィード - savedFeedsPref
  pinned?: Array<string>
  saved?: Array<string>

  // カスタムフィード - savedFeedsPrefV2
  items?: Array<{
    pinned?: Array<string>
    saved?: Array<string>
    timelineIndex?: number
  }>
}
