type TTSession = {
  [index: string]: any
  accessJwt: string
  did: string
  handle: string
  email?: string
  emailConfirmed?: boolean
  refreshJwt: string
  __service?: string // Injected
  __serviceName?: string // Injected
  __avatar?: string // Injected
}

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
  mutedByList?: any
  blockedBy?: boolean
  blocking?: string
  blockingByList?: any
  following?: string
  followedBy?: string
  [k: string]: unknown
}

type TTUser = {
  associated?: {
    lists: number
    feedgens: number
    labeler: boolean
  }
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
    embed?: {
      $type: string
      images?: TTImages[]
      record?: TTPost
    }
    facets?: any
    langs?: string[]
    reply?: {
      root: {
        cid: string
        uri: string
      }
      parent: {
        cid: string
        uri: string
      }
    }
    text?: string

    subject?: {
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
  aspectRatio?: TTAspectRatio
}

type TTAspectRatio = {
  width: number
  height: number
}

type TTLabel = {
  cid?: string // Only post
  cts: string // Date
  exp?: string
  neg?: boolean
  sig?: Uint8Array
  src: string // DID
  uri: string
  val: string
  ver?: number
}

type TTContentVisibility = "hide" | "show" | "warn"

type TTLabelOnWarn = "null" | "blur" | "blur-media" | "alert"

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
    oldestQuotedPostDisplay?: boolean
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
  notFound?: boolean
  record: {
    $type: string
    createdAt: string
    embed?: {
      $type: string
      images?: Array<TTImage>
      external?: TTExternal
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

type TTList = {
  uri: string
  cid: string
  creator: AppBskyActorDefs.ProfileView
  name: string
  purpose: ListPurpose
  description?: string
  descriptionFacets?: AppBskyRichtextFacet.Main[]
  avatar?: string
  viewer?: {
    muted?: boolean;
    blocked?: string;
  }
  indexedAt: string

  // マイリスト用
  items?: Array<TTListItem>
}

type TTListItem = {
  uri: string
  subject: AppBskyActorDefs.ProfileView
}

type TTNotificationReason = "reply"
  | "quote"
  | "mention"
  | "repost"
  | "like"
  | "follow"
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
  list?: TTList
  reason: TTNotificationReason
  reasonSubject?: string
  __folding: boolean
}

type TTProfile = {
  __log?: any // Injected
  __isDidPlc?: boolean // Injected
  __createdAt?: string // Injected
  did: string
  handle: string
  displayName: string
  description?: string
  avatar: string
  banner: string
  followsCount: number
  followersCount: number
  postsCount: number
  associated?: {
    lists: number
    feedgens: number
    labeler: boolean
  }
  indexedAt: string
  labels?: Array<TTLabel>
  viewer: TTUserViewer
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

type TTCidUri = {
  uri: string
  cid: string
  [k: string]: unknown
}

interface TITaggedSuggestion {
  tag: string
  feeds: string[]
  users: string[]
  profiles?: TTProfile[]
}
