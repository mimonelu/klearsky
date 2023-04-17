type TTUserViewer = {
  muted: boolean
  following?: string
  followedBy?: string
  [k: string]: unknown
}

type TTUser = {
  did: string
  handle: string
  displayName: string
  description?: string
  avatar?: string
  viewer: TTUserViewer
  [k: string]: unknown
}

type TTRecord = {
  cid: string
  uri: string
  value: {
    $type: string
    createdAt: string
    subject: {
      cid: string
      uri: string
    }
  }
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

type TTExternal = {
  uri: string
  thumb?: string
  title?: string
  description?: string
}

type TTImage = {
  image?: {
    mimeType: string
    ref: {
      $link: string
    }
    size: number
  }

  thumb?: string
  fullsize?: string

  alt: string
}

type TTPost = {
  __createdAt: string // Injected
  uri: string
  cid: string
  author: TTUser
  embed?: {
    $type: string
    external?: TTExternal
    images?: Array<TTImage>
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
  value?: {
    text: string
    $type: string
    createdAt: string
    __textHtml?: string // Injected
  }
  replyCount: number
  repostCount: number
  likeCount: number
  indexedAt: string
  viewer: {
    repost?: string
    like?: string
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
  __folding?: boolean // Injected
  __replyDisplay?: boolean // Injected
  [k: string]: unknown
}

type TTFileSchema = {
  blob: BlobRef
  mimeType: string
}

type TTInviteCode = {
  code: string
  available: number
  disabled: boolean
  forAccount: string
  createdBy: string
  createdAt: string
  uses: {
    usedBy: string
    usedAt: string
    [k: string]: unknown
  }[]
  [k: string]: unknown;
}

type TTNotification = {
  avatar?: string
  cid: string
  displayName?: string
  handle: string
  indexedAt: string
  reason:
    | "reply"
    | "quote"
    | "mention"
    | "repost"
    | "like"
    | "follow"
    | "invite"
    | (string & {})
  reasonSubject?: string
  text?: string
  uri?: string
}

type TTProfile = {
  __createdAt?: string // Injected
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
