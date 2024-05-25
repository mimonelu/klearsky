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
