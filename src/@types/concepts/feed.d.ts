type TTFeed = {
  post: TTPost
  reply?: {
    root: TTPost
    grandparentAuthor?: TTProfile
    parent: TTPost
    [k: string]: unknown
  }
  reason?: TTReason
  feedContext?: string
  reqId?: string
  __cursor?: string // Injected
  __id: string // Injected
  __folding?: boolean // Injected
  __replyDisplay?: boolean // Injected
  __fetchingLine?: boolean // Injected
  [k: string]: unknown
}

type TTFeedGenerator = {
  acceptsInteractions?: boolean
  avatar: string
  cid: string
  creator: TTUser
  description: string
  descriptionFacets?: AppBskyRichtextFacet.Main[]
  did: string
  displayName: string
  indexedAt: string
  likeCount: number
  uri: string
  viewer: {
    like?: string
    [k: string]: any
  }
}

type TTFeedInteraction = {
  item?: string
  event?:
    "app.bsky.feed.defs#requestLess" |
    "app.bsky.feed.defs#requestMore" |
    "app.bsky.feed.defs#clickthroughItem" |
    "app.bsky.feed.defs#clickthroughAuthor" |
    "app.bsky.feed.defs#clickthroughReposter" |
    "app.bsky.feed.defs#clickthroughEmbed" |
    "app.bsky.feed.defs#interactionSeen" |
    "app.bsky.feed.defs#interactionLike" |
    "app.bsky.feed.defs#interactionRepost" |
    "app.bsky.feed.defs#interactionReply" |
    "app.bsky.feed.defs#interactionQuote" |
    "app.bsky.feed.defs#interactionShare"
  feedContext?: string
  reqId?: string
}
