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
  "repost-via-repost" |
  "subscribed-post"
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

// 通知設定

type TTNotificationPreference = {
  list: boolean
  push: boolean
}

type TTNotificationFilterablePreference = {
  include: "all" | "follows"
  list: boolean
  push: boolean
}

type TTNotificationChatPreference = {
  include: "all" | "accepted"
  push: boolean
}

type TTNotificationPreferences = {
  preferences: {
    chat: TTNotificationChatPreference
    follow: TTNotificationFilterablePreference
    like: TTNotificationFilterablePreference
    likeViaRepost: TTNotificationFilterablePreference
    mention: TTNotificationFilterablePreference
    quote: TTNotificationFilterablePreference
    reply: TTNotificationFilterablePreference
    repost: TTNotificationFilterablePreference
    repostViaRepost: TTNotificationFilterablePreference
    starterpackJoined: TTNotificationPreference
    subscribedPost: TTNotificationPreference
    unverified: TTNotificationPreference
    verified: TTNotificationPreference
  }
}
