type TTUserViewer = {
  muted: boolean
  following?: string
  followedBy?: string
  [k: string]: unknown
}

type TTUser = {
  did: string
  declaration: {
    actorType: string
    cid: string
    [k: string]: unknown
  }
  handle: string
  displayName: string
  avatar?: string
  viewer: TTUserViewer
  [k: string]: unknown
}

type TTEntity = {
  type: string
  index: {
    end: number
    start: number
  }
  value: string
}

type TTReason = {
  $type: string
  by: {
    did: string
    declaration: {
      actorType: string
      cid: string
    }
    handle: string
    displayName: string
    avatar: string
    viewer: TTUserViewer
  }
  indexedAt: string
}

type TTPost = {
  uri: string
  cid: string
  author: TTUser
  embed?: {
    $type: string
    external?: {
      uri: string
      thumb?: {
        cid: string
        mimeType: string
      }
      title?: string
      description?: string
    }
    images?: Array<{
      thumb: string
      fullsize: string
      alt: string
    }>
    [k: string]: unknown
  }
  record: {
    text: string
    __textHtml: string // Injected
    $type: string
    createdAt: string
    reply?: {
      root?: {
        cid: string
        uri: string
      }
      parent?: {
        cid: string
        uri: string
      }
    }
    embed?: {
      $type: string
      images?: Array<{
        alt: string
        image: {
          cid: string
          mimeType: string
        }
      }>
      [k: string]: unknown
    }
    entities?: Array<TTEntity>
    [k: string]: unknown
  }
  replyCount: number
  repostCount: number
  upvoteCount: number
  downvoteCount: number
  indexedAt: string
  viewer: {
    repost?: string
    upvote?: string
    downvote?: string
    [k: string]: unknown
  }
  __reason?: TTReason // Injected
  [k: string]: unknown
}

type TTFeed = {
  post: TTPost
  reply?: {
    root: TTPost
    parent: TTPost
    [k: string]: unknown
  }
  reason?: TTReason
  __replyDisplay?: boolean // Injected
  [k: string]: unknown
}

type TTFileSchema = {
  cid: string
  mimeType: string
}

type TTNotification = {
  avatar?: string
  cid: string
  displayName?: string
  handle: string
  indexedAt: string
  reason:
    | "reply"
    | "mention"
    | "repost"
    | "vote"
    | "follow"
    | "invite"
    | (string & {})
  reasonSubject?: string
}

type TTProfile = {
  did: string
  declaration: {
    actorType: string
    cid: string
  }
  handle: string
  displayName: string
  description?: string
  __descriptionHtml: string // Injected
  avatar: string
  banner: string
  followsCount: number
  followersCount: number
  postsCount: number
  creator: string
  indexedAt: string
  viewer: TTUserViewer
  myState: {
    follow?: string
    muted: boolean
  }
  [k: string]: unknown
}
