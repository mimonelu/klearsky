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

  sanitizeQuote(post.embed)
}

// 引用先のポストに階層ごとに `__custom` を追加する
function sanitizeQuote (embed?: TTEmbedView) {
  const quote = resolveEmbed(embed).quote
  if (quote?.$type !== "app.bsky.embed.record#viewRecord") {
    return
  }

  if (quote.__custom == null) {
    quote.__custom = {}
  }

  sanitizeQuote(quote.embeds?.[0])
}
