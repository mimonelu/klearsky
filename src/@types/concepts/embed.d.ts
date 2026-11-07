// `post.embed` や `viewRecord.embeds[n]` の形を View、`post.record.embed` や `viewRecord.value.embed` の形を Raw と呼ぶ
// NOTICE: API の型のユニオンは `{ $type: string }` を含み `$type` で絞り込めないため、既知の型だけを並べる

// メディア
type TTEmbedMediaView =
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedImages.View>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedVideo.View>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedGallery.View>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedExternal.View>

type TTEmbedMediaRaw =
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedImages.Main>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedVideo.Main>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedGallery.Main>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedExternal.Main>

// embed 全体
type TTEmbedView =
  | TTEmbedMediaView
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.View>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecordWithMedia.View>

type TTEmbedRaw =
  | TTEmbedMediaRaw
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.Main>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecordWithMedia.Main>

// 引用先
type TTEmbedQuoteRecord = import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewRecord>

type TTEmbedQuote =
  | TTEmbedQuoteRecord
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewNotFound>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewBlocked>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyEmbedRecord.ViewDetached>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyFeedDefs.GeneratorView>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyGraphDefs.ListView>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyLabelerDefs.LabelerView>
  | import("@atproto/api").$Typed<import("@atproto/api").AppBskyGraphDefs.StarterPackViewBasic>
