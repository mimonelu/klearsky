type MainState = {
  atp: AbstractAtpWrapper
  mounted: boolean
  hasLogin: boolean
  userProfile: null | Profile
  timelineFeeds: Array<Feed>
  timelineCursor?: string
  currentProfile: null | Profile
  currentFeeds: null | Array<Feed>
  currentCursor: null | string
  currentQuery: LocationQuery
  currentUsers: null | Array<Following> | Array<Follower>
  notifications: Array<KNotification>
  notificationCursor?: string
  processing: boolean
  sendPostPopupProps: {
    visibility: boolean
    type: "post" | "reply" | "repost"
    post: null | Post
  }
  fetchUserProfile: Function
  fetchCurrentProfile: Function
  fetchCurrentAuthorFeed: Function
  fetchTimeline: Function
  fetchPostThread: Function
  fetchNotifications: Function
  updateUserProfile: Function
  openSendPostPopup: Function
}
