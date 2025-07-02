// Activity Subscription関連の型定義

type TTActivitySubscription = {
  subject: string
  createdAt: string
  activitySubscription: TTActivitySubscriptionType
}

type TTActivitySubscriptionType = {
  $type: "app.bsky.notification.activitySubscription"
}

type TTActivitySubscriptionList = {
  subscriptions: Array<TTUser>
  cursor?: string
}

type TTActivitySubscriptionProfile = {
  did: string
  handle: string
  displayName?: string
  avatar?: string
}