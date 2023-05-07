type TTSetting = {
  language?: string
  autoTranslation?: boolean
  autoTranslationIgnoreLanguage?: string
  fontSize?: string
  replyControl?: Array<number>
  repostControl?: Array<number>
  imageControl?:
    "all" |
    "followingEx" |
    "following" |
    "self" |
    "none"
  imageAspectRatio?: string
  layout?:
    "default" |
    "defaultLeft" |
    "defaultRight" |
    "slim" |
    "slimLeft" |
    "slimRight"
  colorTheme?: string
  mainAreaOpacity?: number
  backgroundImage?: string
  backgroundOpacity?: number
  lightning?: string
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

  listProcessing: boolean

  timelineFeeds: Array<TTFeed>
  timelineCursor?: string

  currentPath: string
  currentQuery: LocationQuery

  currentPosts: Array<TTPost>

  inSameProfilePage: boolean
  currentProfile: null | TTProfile
  currentAuthorFeeds: Array<TTFeed>
  currentAuthorCursor?: string
  currentAuthorReposts: Array<TTFeed>
  currentAuthorRepostsCursor?: string
  currentAuthorLikes: Array<TTFeed>
  currentAuthorLikesCursor?: string
  currentFollowers: Array<TTUser>
  currentFollowersCursor?: string
  currentFollowings: Array<TTUser>
  currentFollowingsCursor?: string

  currentHotFeeds: Array<TTFeed>
  currentHotCursor?: string

  currentSearchKeywordTerm: string
  currentSearchKeywordResults: Array<any>

  currentSearchUsers: Array<TTUser>
  currentSearchUsersCursor?: string
  currentSearchUserTerm: string
  currentSearchLastUserTerm: string

  currentRepostUsers: Array<TTUser>
  currentRepostUsersUri?: string
  currentRepostUsersCursor?: string
  repostUsersPopupDisplay: boolean

  currentLikeUsers: Array<TTUser>
  currentLikeUsersUri?: string
  currentLikeUsersCursor?: string
  likeUsersPopupDisplay: boolean

  currentMutingUsers: Array<TTUser>
  currentMutingUsersCursor?: string

  currentBlockingUsers: Array<TTUser>
  currentBlockingUsersCursor?: string

  notifications: Array<TTNotificationGroup>
  notificationCursor?: string
  notificationCount: number

  loginPopupDisplay: boolean
  loginPopupAutoDisplay: any // TODO:

  inviteCodes: Array<TTInviteCode>

  sendPostPopupProps: {
    display: boolean
    type: TTPostType
    post?: TTPost
    text?: string
  }

  imagePopupProps: {
    display: boolean
    largeUri: string
    smallUri: string
  }

  settings: TTSettings
  currentSetting: TTSetting
  saveSettings: () => void
  updateSettings: () => void
  updateI18nSetting: () => void
  updateColorThemeSetting: () => void
  backgroundImage: any // TODO:

  // インフィニットスクロール用プロパティ
  scrolledToBottom: boolean

  $setI18n?: Function
  $getI18n?: Function

  forceUpdate: () => void
  fetchUserProfile: () => Promise<void>
  fetchCurrentProfile: (handle: string) => Promise<void>
  fetchCurrentAuthorFeed: (direction: "new" | "old") => Promise<void>
  fetchAuthorReposts: (direction: "new" | "old") => Promise<void>
  fetchAuthorLikes: (direction: "new" | "old") => Promise<void>
  fetchHotFeeds: (direction: "old" | "new") => Promise<void>
  fetchTimeline: (direction: "old" | "new") => Promise<void>
  fetchPostThread: () => Promise<void>
  fetchNotifications: (limit: number, direction: "new" | "old") => Promise<void>
  fetchFollowers: (direction: "new" | "old") => Promise<void>
  fetchFollowings: (direction: "new" | "old") => Promise<void>
  updateUserProfile: (profile: TTUpdateProfileParams) => Promise<void>
  openSendPostPopup: (
    type: TTPostType,
    post?: TTPost,
    text?: string
  ) => Promise<boolean>
  closeSendPostPopup: (done: boolean) => void
  openRepostUsersPopup: (uri: string) => void
  closeRepostUsersPopup: () => void
  openLikeUsersPopup: (uri: string) => void
  closeLikeUsersPopup: () => void

  messagePopupDisplay: boolean
  messagePopupTitle?: string
  messagePopupText?: string
  openMessagePopup: (title?: string, text?: string) => void
  closeMessagePopup: () => void

  confirmationPopupDisplay: boolean
  confirmationPopupTitle?: string
  confirmationPopupText?: string
  confirmationPopupResult: boolean
  openConfirmationPopup: (title?: string, text?: string) => Promise<boolean>
  closeConfirmationPopup: () => void
  applyConfirmationPopup: () => void
}
