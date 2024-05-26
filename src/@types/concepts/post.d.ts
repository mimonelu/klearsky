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
  uri: string
  value?: TIPostValue
  viewer?: {
    repost?: string
    like?: string
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
  lightning?: string // カスタムフィールド
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
  via?: string // カスタムフィールド
  subject?: {
    cid: string
    uri: string
  }
  [k: string]: unknown
}

interface TIEmbed {
  $type: string
  external?: TTExternal
  images?: Array<TTImage>
  record?: TTPost
  [k: string]: unknown
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
  images?: Array<File>
  alts?: Array<string>
  languages?: Array<string>
  labels?: Array<string>
  lightning?: string
  tags?: Array<TTMyTag>
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
