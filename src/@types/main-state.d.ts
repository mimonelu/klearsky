type TTSetting = {
  language?: string
}

type TTSettings = {
  [did: string]: TTSetting
}

type MainState = {
  atp: TIAtpWrapper
  mounted: boolean
  updateKey: number
  hasLogin: boolean
  processing: boolean

  userProfile: null | TTProfile

  timelineFeeds: Array<TTFeed>
  timelineCursor?: string

  currentProfile: null | TTProfile
  currentFeeds: Array<TTFeed>
  currentCursor?: string
  currentPath: string
  currentQuery: LocationQuery

  currentFollowers: Array<TTUser>
  currentFollowings: Array<TTUser>

  currentSearchKeywordTerm: string
  currentSearchKeywordResults: Array<any>

  currentSearchUsers: Array<TTUser>
  currentSearchUsersCursor?: string
  currentSearchUserTerm: string
  currentSearchLastUserTerm: string

  notifications: Array<TTNotification>
  notificationCursor?: string
  notificationCount: number

  loginPopupDisplay: boolean

  sendPostPopupProps: {
    display: boolean
    type: TTPostType
    post?: TTPost
  }

  imagePopupProps: {
    display: boolean
    uri: string
  }

  settings: TTSettings
  currentSetting: TTSetting
  saveSettings: () => void
  updateSettings: () => void

  forceUpdate: () => void
  fetchUserProfile: () => Promise<void>
  fetchCurrentProfile: (handle: string) => Promise<void>
  fetchCurrentAuthorFeed: (direction: "new" | "old") => Promise<void>
  fetchTimeline: (direction: "old" | "new") => Promise<void>
  fetchPostThread: () => Promise<void>
  fetchNotifications: (
    limit: number,
    direction: "new" | "old",
    noNewProp?: boolean
  ) => Promise<void>
  fetchFollowers: (direction: "new" | "old") => Promise<void>
  fetchFollowings: (direction: "new" | "old") => Promise<void>
  updateUserProfile: (profile: TTUpdateProfileParams) => Promise<void>
  openSendPostPopup: (type: TTPostType, post?: TTPost) => Promise<boolean>
}
