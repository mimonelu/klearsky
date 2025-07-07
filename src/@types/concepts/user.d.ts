type TTUser = {
  associated?: TIAssociated
  avatar?: string
  createdAt?: string
  description?: string
  did: string
  displayName: string
  handle: string
  labels?: Array<TTLabel>
  status?: TIActorStatus
  verification?: TIVerification
  viewer: TTUserViewer
  [k: string]: unknown
}

interface TIAssociated {
  activitySubscription?: {
    allowSubscriptions: "followers" | "mutuals" | "none"
  }
  chat?: {
    allowIncoming: TTAllowIncoming
  }
  feedgens?: number
  labeler?: boolean
  lists?: number
  starterPacks?: number
  [k: string]: unknown
}

type TTUserViewer = {
  activitySubscription?: {
    post: boolean
    reply: boolean
  }
  blockedBy?: boolean
  blocking?: string
  blockingByList?: any
  followedBy?: string
  following?: string
  like?: string
  muted?: boolean
  mutedByList?: any
  knownFollowers?: {
    count: number
    followers: Array<TTUser>
  }
  [k: string]: unknown
}
