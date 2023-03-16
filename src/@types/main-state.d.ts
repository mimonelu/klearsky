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
  processing: boolean
  challengingAccount?: {
    service?: string
    handle?: string
  }
  sendPostPopupProps: {
    visibility: boolean
    type: "post" | "reply" | "repost"
    post: null | Post
  }
  createFollow: (did: string, declarationCid: string) => Promise<void>
  deleteFollow: (uri: string) => Promise<void>
  fetchUserProfile: Function
  fetchCurrentProfile: Function
  fetchCurrentAuthorFeed: Function
  fetchFeeds: Function
  updateUserProfile: Function
  openSendPostPopup: Function
}
