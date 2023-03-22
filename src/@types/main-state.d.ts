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
  fetchUserProfile: () => Promise<void>
  fetchCurrentProfile: (handle: string) => Promise<void>
  fetchCurrentAuthorFeed: (direction: "new" | "old") => Promise<void>
  fetchTimeline: (direction: "old" | "new") => Promise<void>
  fetchPostThread: () => Promise<void>
  fetchNotifications: (direction: "new" | "old") => Promise<void>
  fetchFollowers: (direction: "new" | "old") => Promise<void>
  fetchFollowings: (direction: "new" | "old") => Promise<void>
  updateUserProfile: (profile: UpdateProfileParams) => Promise<void>
  openSendPostPopup: (type: "post" | "reply" | "quoteRepost", post?: Post) => Promise<boolean>
}
