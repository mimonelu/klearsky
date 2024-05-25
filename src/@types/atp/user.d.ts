type TTProfile = {
  __log?: any // Injected
  __createdAt?: string // Injected
  associated?: TIAssociated
  avatar: string
  banner: string
  description?: string
  did: string
  displayName: string
  followersCount: number
  followsCount: number
  handle: string
  indexedAt: string
  labels?: Array<TTLabel>
  postsCount: number
  viewer: TTUserViewer

  // 固定ポスト
  pinnedPost?: string
}

type TTUser = {
  associated?: TIAssociated
  avatar?: string
  description?: string
  did: string
  displayName: string
  handle: string
  labels?: Array<TTLabel>
  viewer: TTUserViewer
  [k: string]: unknown
}

interface TIAssociated {
  chat?: {
    allowIncoming: TTAllowIncoming
  }
  feedgens?: number
  labeler?: boolean
  lists?: number
  [k: string]: unknown
}

type TTUserViewer = {
  blockedBy?: boolean
  blocking?: string
  blockingByList?: any
  followedBy?: string
  following?: string
  muted: boolean
  mutedByList?: any
  [k: string]: unknown
}
