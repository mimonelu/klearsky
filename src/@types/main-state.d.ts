type MainState = {
  atp: AbstractAtpWrapper
  mounted: boolean
  hasLogin: boolean
  userProfile: null | Profile
  timelineFeeds: Array<Feed>
  timelineCursor?: string
  currentProfile: null | Profile
  currentFeeds: Array<Feed>
  currentCursor?: string
  currentQuery: LocationQuery
  currentFollowers: Array<Follower>
  currentFollowings: Array<Following>

  currentSearchKeywordTerm: string
  currentSearchKeywordResults: Array<any>

  currentSearchUsers: Array<User>
  currentSearchUsersCursor?: string
  currentSearchUserTerm: string
  currentSearchLastUserTerm: string

  notifications: Array<KNotification>
  notificationCursor?: string
  processing: boolean
  sendPostPopupProps: {
    visibility: boolean
    type: "post" | "reply" | "quoteRepost"
    post?: Post
  }
  fetchUserProfile: Function
  fetchCurrentProfile: Function
  fetchCurrentAuthorFeed: Function
  fetchTimeline: Function
  fetchPostThread: Function
  fetchNotifications: Function
  fetchFollowers: Function
  fetchFollowings: Function
  updateUserProfile: Function
  openSendPostPopup: Function
}
