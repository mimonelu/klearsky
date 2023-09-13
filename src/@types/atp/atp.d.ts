type TTServerInfo = {
  inviteCodeRequired?: boolean
  availableUserDomains: string[]
  links?: {
    privacyPolicy?: string
    termsOfService?: string
  }
}

type TTUserViewer = {
  muted: boolean
  blockedBy?: boolean
  blocking?: string
  following?: string
  followedBy?: string
  [k: string]: unknown
}

type TTUser = {
  avatar?: string
  description?: string
  did: string
  displayName: string
  handle: string
  labels?: Array<TTLabel>
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
      bytes?: Uint8Array
    }
    size: number
  }

  thumb?: string
  fullsize?: string

  alt: string
}

type TTLabel = {
  cid?: string // Only post
  cts: string // Date
  neg?: boolean
  src: string // DID
  uri: string
  val: string
}

type TTContentVisibility = "always-hide" | "always-warn" | "hide" | "show" | "warn"

type TTPreference = {
  $type: string

  // ラベル
  enabled?: boolean
  label?: string
  visibility?: TTContentVisibility

  // カスタムフィード
  pinned?: Array<string>
  saved?: Array<string>
}

type TTPost = {
  // Injected
  __custom: {
    forcePosition?: string
    reason?: TTReason
    translatedText?: string
    unmask?: boolean
  }

  author: TTUser
  cid: string
  embed?: {
    $type: string
    external?: TTExternal
    images?: Array<TTImage>
    record?: TTPost
    [k: string]: unknown
  }
  indexedAt: string
  labels?: Array<TTLabel>
  likeCount: number
  record: {
    $type: string
    createdAt: string
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
    facets?: any
    langs?: Array<string>
    lightning?: string // カスタムフィールド
    reply?: {
      parent?: {
        cid: string
        uri: string
      }
      root?: {
        cid: string
        uri: string
      }
    }
    text: string
    via?: string // カスタムフィールド
    [k: string]: unknown
  }
  replyCount: number
  repostCount: number
  uri: string
  value?: {
    $type: string
    createdAt: string
    entities?: Array<TTEntity>
    facets?: any
    text: string
    langs?: Array<string>
    [k: string]: unknown
  }
  viewer?: {
    repost?: string
    like?: string
    [k: string]: unknown
  }
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
  __cursor?: string // Injected
  __id: string // Injected
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
  [k: string]: unknown
}

type TTNotificationReason = "reply"
  | "quote"
  | "mention"
  | "repost"
  | "like"
  | "follow"
  | "invite"
  | (string & {})

type TTNotification = {
  avatar?: string
  cid: string
  did: string
  displayName?: string
  handle: string
  following: boolean
  indexedAt: string
  reason: TTNotificationReason
  text?: string
  uri: string
  isRead: boolean
}

type TTNotificationGroup = {
  id: string
  indexedAt: Date
  notifications: Array<TTNotification>
  post?: TTPost
  generator?: TTFeedGenerator
  reason: TTNotificationReason
  reasonSubject?: string
  __folding: boolean
}

type TTProfile = {
  __log?: any // Injected
  __createdAt?: string // Injected
  did: string
  declaration: {
    actorType: string
    cid: string
  }
  handle: string
  displayName: string
  description?: string
  avatar: string
  banner: string
  followsCount: number
  followersCount: number
  postsCount: number
  creator: string
  indexedAt: string
  labels?: Array<TTLabel>
  viewer: TTUserViewer
  myState: {
    follow?: string
    muted: boolean
  }
  [k: string]: unknown
}

type TTFeedGenerator = {
  avatar: string
  cid: string
  creator: TTUser
  description: string
  did: string
  displayName: string
  indexedAt:string
  likeCount: number
  uri: string
  viewer: {
    like?: string
    [k: string]: any
  }
}
