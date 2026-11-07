import resolveEmbed from "@/composables/util/resolve-embed"

export default function (responses: Array<any>) {
  // sanitizePost
  for (const response of responses) {
    // Feed
    if (
      response?.post != null ||
      response?.reply != null
    ) {
      if (response.post != null) {
        sanitizePost(
          response.post,
          response.opThreadPostIndex,
          response.opThreadPostCount
        )
      }
      if (response.reply?.root != null) {
        sanitizePost(response.reply.root)
      }
      if (response.reply?.parent != null) {
        sanitizePost(response.reply.parent)
      }
    }

    // Post
    else {
      sanitizePost(response)
    }

    // `reason` - リポストのみ（`reasonPin` 等は除く）
    if (
      response.post != null &&
      response.reason?.$type === "app.bsky.feed.defs#reasonRepost"
    ) {
      response.post.__custom.reason = response.reason
    }
  }
}

function sanitizePost (post: any, opThreadPostIndex?: number, opThreadPostCount?: number) {
  // `post.__custom` の追加
  if (post.__custom == null) {
    post.__custom = {}
  }

  // ポストスレッドのインデックスとカウント
  if (opThreadPostIndex != null) {
    post.__custom.opThreadPostIndex = opThreadPostIndex
  }
  if (opThreadPostCount != null) {
    post.__custom.opThreadPostCount = opThreadPostCount
  }

  // アニメーション画像向けに BlobRef をコピー
  copyImages(post.record?.embed, post.embed)

  sanitizeQuote(post.embed)
}

// 引用先のポストを階層ごとにサニタイズする
function sanitizeQuote (embed?: TTEmbedView) {
  const quote = resolveEmbed(embed).quote
  if (quote?.$type !== "app.bsky.embed.record#viewRecord") {
    return
  }

  // `__custom` の追加
  if (quote.__custom == null) {
    quote.__custom = {}
  }

  // アニメーション画像向けに BlobRef をコピー
  copyImages(quote.value?.embed, quote.embeds?.[0])

  sanitizeQuote(quote.embeds?.[0])
}

function copyImages (rawEmbed?: any, viewEmbed?: any) {
  const src = rawEmbed?.images ?? rawEmbed?.media?.images
  const dst = viewEmbed?.images ?? viewEmbed?.media?.images
  if (src == null || dst == null) {
    return
  }
  for (let i = 0; i < src.length; i ++) {
    if (dst[i] != null) {
      dst[i].image = src[i].image
    }
  }
}
