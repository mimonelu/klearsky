export default function (responses: Array<any>) {
  // sanitizePost
  for (const response of responses) {
    // Feed
    if (
      response?.post != null ||
      response?.reply != null
    ) {
      if (response.post != null) {
        sanitizePost(response.post)
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

    // `reason`
    if (
      response.post != null &&
      response.reason != null &&
      response.reason.$type?.startsWith("app.bsky.feed.defs#reason")
    ) {
      response.post.__custom.reason = response.reason
    }
  }
}

function sanitizePost (post: any) {
  // `post.__custom` の追加
  if (post.__custom == null) {
    post.__custom = {}
  }

  // 引用RP - `embeds[0]` -> `embed`
  if (post.embed?.record?.embeds?.[0] != null) {
    post.embed.record.embed = post.embed.record.embeds[0]
    delete post.embed.record.embeds
  }

  // メディア付き引用RP - `embeds[0]` -> `embed`
  if (post.embed?.record?.record?.embeds?.[0] != null) {
    post.embed.record.record.embed = post.embed.record.record.embeds[0]
    delete post.embed.record.record.embeds
  }

  // メディア付き引用RP - `record.record` -> `record` - 2階層目
  if (post.embed?.record?.record?.$type === "app.bsky.embed.record#viewRecord") {
    post.embed.record = post.embed.record.record

    // `post.__custom` の追加
    if (post.embed.__custom == null) {
      post.embed.__custom = {}
    }
  }

  // メディア付き引用RP - `record.record` -> `record` - 3階層目
  if (post.embed?.record?.embed?.record?.record?.$type === "app.bsky.embed.record#viewRecord") {
    post.embed.record.embed.record = post.embed.record.embed.record.record

    // `post.__custom` の追加
    if (post.embed.record.embed.__custom == null) {
      post.embed.record.embed.__custom = {}
    }
  }

  // 引用RP - `value` -> `record` - 2階層目
  if (post.embed?.record?.value?.$type === "app.bsky.feed.post") {
    post.embed.record.record = post.embed.record.value
    delete post.embed.record.value

    // `post.__custom` の追加
    if (post.embed.record.__custom == null) {
      post.embed.record.__custom = {}
    }
  }

  // 引用RP - `value` -> `record` - 3階層目
  if (post.embed?.record?.embed?.record?.value?.$type === "app.bsky.feed.post") {
    post.embed.record.embed.record.record = post.embed.record.embed.record.value
    delete post.embed.record.embed.record.value

    // `post.__custom` の追加
    if (post.embed.record.embed.record.__custom == null) {
      post.embed.record.embed.record.__custom = {}
    }
  }

  // 通常ポスト - アニメーション画像向けに BlobRef をコピー
  if (
    post.record?.embed?.images != null &&
    post.embed?.images != null
  ) {
    copyImages(
      post.record.embed.images,
      post.embed.images
    )
  }

  // メディア付き引用RP - アニメーション画像向けに BlobRef をコピー
  if (
    post.record?.embed?.media?.images != null &&
    post.embed?.media?.images != null
  ) {
    copyImages(
      post.record.embed.media.images,
      post.embed.media.images
    )
  }

  // 通常ポスト内メディア付き引用RP - アニメーション画像向けに BlobRef をコピー
  if (
    post.embed?.record?.record?.embed?.images != null &&
    post.embed?.record?.embed?.images != null
  ) {
    copyImages(
      post.embed.record.record.embed.images,
      post.embed.record.embed.images
    )
  }

  // 通常ポスト内メディア付き引用RP - アニメーション画像向けに BlobRef をコピー - 2階層目
  if (
    post.embed?.record?.record?.embed?.media?.images != null &&
    post.embed?.record?.embed?.media?.images != null
  ) {
    copyImages(
      post.embed.record.record.embed.media.images,
      post.embed.record.embed.media.images
    )
  }
}

function copyImages (src: any[], dst: any[]) {
  for (let i = 0; i < src.length; i ++) {
    const image = src[i]
    if (dst[i] != null) {
      dst[i].image = image.image
    }
  }
}
