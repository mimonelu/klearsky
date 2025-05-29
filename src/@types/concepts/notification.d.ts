type TTNotificationStrictReason =
  "reply" |
  "quote" |
  "mention" |
  "repost" |
  "like" |
  "follow"

type TTNotificationReason =
  TTNotificationStrictReason |
  "likeGenerator" | // Klearsky 独自仕様
  "starterpack-joined" |
  "verified" |
  "like-via-repost" |
  "repost-via-repost"
  (string & {})

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
  starterPack?: TIStarterPack
  __folding: boolean
}
