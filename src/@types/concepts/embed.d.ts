// `post.embed` や `viewRecord.embeds[n]` の形を View、`post.record.embed` や `viewRecord.value.embed` の形を Raw と呼ぶ
// NOTICE: API の型のユニオンは `{ $type: string }` を含み `$type` で絞り込めないため、既知の型だけを並べる

// メディア
type TTEmbedMediaView =
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedImages.View>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedVideo.View>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedExternal.View>
  | {
    $type: "app.bsky.embed.gallery#view"
    items: Array<import("@atproto/api").AppBskyEmbedGallery.ViewImage>
  }

type TTEmbedMediaRaw =
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedImages.Main>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedVideo.Main>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedExternal.Main>
  | {
    $type: "app.bsky.embed.gallery"
    items: Array<import("@atproto/api").AppBskyEmbedGallery.Image>
  }

// 引用先
type TTEmbedQuoteRecord = Omit<import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewRecord>, "embeds" | "value"> & {
  __custom?: TTPost["__custom"] // Injected
  embeds?: Array<TTEmbedView>
  value: TIPostValue
}

type TTEmbedQuote =
  | TTEmbedQuoteRecord
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewNotFound>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewBlocked>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewDetached>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyFeedDefs.GeneratorView>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyGraphDefs.ListView>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyLabelerDefs.LabelerView>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyGraphDefs.StarterPackViewBasic>

// embed 全体
type TTEmbedRecordView = {
  $type: "app.bsky.embed.record#view"
  record: TTEmbedQuote
}

type TTEmbedView =
  | TTEmbedMediaView
  | TTEmbedRecordView
  | {
    $type: "app.bsky.embed.recordWithMedia#view"
    record: TTEmbedRecordView
    media: TTEmbedMediaView
  }

type TTEmbedRaw =
  | TTEmbedMediaRaw
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.Main>
  | {
    $type: "app.bsky.embed.recordWithMedia"
    record: import("@atproto/api").AppBskyEmbedRecord.Main
    media: TTEmbedMediaRaw
  }

// `resolveEmbed` の結果
type TTResolvedEmbed = {
  media?: TTEmbedMediaView | TTEmbedMediaRaw
  quote?: TTEmbedQuote // View のみ
  quoteRef?: import("@atproto/api").ComAtprotoRepoStrongRef.Main // Raw のみ
}
