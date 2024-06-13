type TTFeed = {
  post: TTPost
  reply?: {
    root: TTPost
    grandparentAuthor?: TTProfile
    parent: TTPost
    [k: string]: unknown
  }
  reason?: TTReason
  __cursor?: string // Injected
  __id: string // Injected
  __folding?: boolean // Injected
  __replyDisplay?: boolean // Injected
  __fetchingLine?: boolean // Injected
  [k: string]: unknown
}

type TTFeedGenerator = {
  avatar: string
  cid: string
  creator: TTUser
  description: string
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
