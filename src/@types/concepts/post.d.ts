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
  embed?: TIEmbed
  indexedAt: string
  labels?: Array<TTLabel>
  likeCount: number
  notFound?: boolean
  record: TIPostValue
  replyCount: number
  repostCount: number
  quoteCount: number
  uri: string
  value?: TIPostValue
  viewer?: {
    repost?: string
    like?: string
    replyDisabled?: boolean
    threadMuted?: boolean
    embeddingDisabled?: boolean
    pinned?: boolean
    [k: string]: unknown
  }
  [k: string]: unknown
}

type TTRecord = {
  cid: string
  uri: string
  value: TIPostValue
}

interface TIPostValue {
  $type: string
  createdAt: string
  embed?: TIEmbed
  entities?: Array<TTEntity>
  facets?: any
  langs?: Array<string>
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
  subject?: {
    cid: string
    uri: string
  }
  text?: string
  [import("@/consts/consts.json").THIRD_PARTY_DOMAIN_LIGHTNING]?: string // カスタムフィールド
  [import("@/consts/consts.json").THIRD_PARTY_DOMAIN_VIA]?: string // カスタムフィールド
  [k: string]: unknown
}

interface TIEmbed {
  $type: string
  external?: TTExternal
  images?: Array<TTImage>
  video?: TIBlob
  record?: TTPost & {
    $type: string
    detached?: boolean
  }
  [k: string]: unknown
}

interface TIBlob {
  $type: "blob"
  mimeType: string
  ref: Blob
  size: number
}

interface TIVideo {
  $type: "app.bsky.embed.video#view"
  cid: string
  playlist: string
  thumbnail: string
  aspectRatio?: TTAspectRatio
  alt?: string // Injected
  video?: {
    $type: "blob"
    ref: Blob
  }
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

  // プレビューリンクカード用
  preview?: string
}

type TTEntity = {
  type: string
  index: {
    end: number
    start: number
  }
  value: string
}

type TTPostType = "post" | "reply" | "quoteRepost"

type TTCreatePostParams = {
  type?: TTPostType
  post?: TTPost
  text?: string
  createdAt?: string
  url?: string
  urlHasImage?: Array<boolean>
  medias?: Array<File>
  alts?: Array<string>
  languages?: Array<string>
  labels?: Array<string>
  lightning?: string
  listMentionDids?: Array<string>
  [k: string]: unknown
}

type TTSendPostPopupParams = {
  display?: boolean
  visibility?: boolean
  type: TTPostType
  post?: TTPost
  text?: string
  url?: string
  fileList?: FileList
  createdAt?: string
}
