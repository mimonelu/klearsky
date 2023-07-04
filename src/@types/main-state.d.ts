type TTWordMute = {
  enabled: Array<boolean>
  keyword: string
}

type TTSetting = {
  uiLanguages?: string
  contentLanguages?: Array<string>
  autoTranslation?: boolean
  autoTranslationIgnoreLanguage?: string
  fontSize?: string
  wordMute?: Array<TTWordMute>
  replyControl?: Array<number>
  repostControl?: Array<number>
  timeControl?: string
  imageControl?:
    "all" |
    "followingEx" |
    "following" |
    "self" |
    "none"
  imageAspectRatio?: string
  globallineLayout?: "post" | "slim"
  layout?:
    "default" |
    "defaultLeft" |
    "defaultRight" |
    "slim" |
    "slimLeft" |
    "slimRight"
  borderRadius?: string
  colorTheme?: string
  mainAreaOpacity?: number
  backgroundImage?: string
  backgroundOpacity?: number
  hideNumberOfReaction?: boolean
  postAnonymization?: boolean
  postLanguages?: Array<string>
  lightning?: string
  [k: string]: any
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

  currentPreferences: Array<TTPreference>
  fetchPreferences: () => Promise<boolean>
  feedPreferences: ComputedRef<undefined | TTPreference>
  currentMyFeeds: { [uri: string]: {
    generator?: TTFeedGenerator
    feeds: Array<TTFeed>
  } }
  currentMyFeedGenerators: Array<TTFeedGenerator>
  fetchMyFeeds: () => Promise<boolean>

  getContentWarningVisibility: (
    authorLabels?: Array<TTLabel>,
    postLabels?: Array<TTLabel>,
  ) => TTContentVisibility
  getConcernedPreferences: (labels?: Array<TTLabel>) => Array<TTPreference>

  currentSearchSuggestionResults: Array<TTUser>
  currentSearchSuggestionCursor?: string

  currentSearchUsers: Array<TTUser>
  currentSearchUsersCursor?: string
  currentSearchUserTerm: string
  currentSearchLastUserTerm: string

  currentSearchKeywordTerm: string
  currentSearchKeywordResults: Array<TTPost>

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

  globallinePosts: Array<TTPost>
  globallineProfiles: { [did: string]: any }
  globallineNumberOfPosts: number

  currentPopularFeedGenerators: Array<TTFeedGenerator>
  fetchPopularFeedGenerators: () => Promise<void>
  currentCustomUri?: string
  currentCustomFeeds: Array<TTFeed>
  currentCustomCursor?: string
  fetchCustomFeeds: (direction: "new" | "old") => Promise<void>

  notifications: Array<TTNotificationGroup>
  notificationCursor?: string
  notificationCount: number
  notificationFetchedFirst: boolean

  loginPopupDisplay: boolean
  loginPopupAutoDisplay: any // TODO:

  inviteCodes: Array<TTInviteCode>
  numberOfInviteCodes: ComputedRef<number>
  numberOfAvailableInviteCodes: ComputedRef<number>

  sendPostPopupProps: {
    display: boolean
    type: TTPostType
    post?: TTPost
    text?: string
    fileList?: FileList
  }

  imagePopupProps: {
    display: boolean
    images: Array<{
      largeUri: string
      smallUri: string
    }>
    index: number
  }

  settings: TTSettings
  currentSetting: TTSetting
  saveSettings: () => void
  resetSettings: () => void
  updateSettings: () => void
  updateI18nSetting: () => void
  updateColorThemeSetting: () => void
  backgroundImage: any // TODO:

  // インフィニットスクロール用プロパティ
  scrolledToBottom: boolean

  // エラーポップアッププロパティ
  errorPopupProps: {
    display: boolean
    error: any
    description: any
  }

  // 通知ポップアップの表示スイッチ
  notificationPopupDisplay: boolean

  // 設定ポップアップの表示スイッチ
  settingsPopupDisplay: boolean

  // アカウントポップアップの表示スイッチ
  accountPopupDisplay: boolean

  // コンテンツ言語ポップアップの表示スイッチ
  contentLanguagesPopupDisplay: boolean

  // ポスト言語ポップアップの表示スイッチ
  postLanguagesPopupDisplay: boolean

  // 招待コード確認ポップアップの表示スイッチ
  inviteCodesPopupDisplay: boolean

  // マイフィードポップアップの表示スイッチ
  myFeedsPopupDisplay: boolean

  // 人気のフィードポップアップの表示スイッチ
  popularFeedsPopupDisplay: boolean

  // ワードミュートポップアップの表示スイッチ
  wordMutePopupDisplay: boolean

  // コンテンツフィルタリングポップアップの表示スイッチ
  contentFilteringPopupDisplay: boolean

  // ミュートユーザーリストポップアップの表示スイッチ
  mutingUsersPopupDisplay: boolean

  // ブロックユーザーリストポップアップの表示スイッチ
  blockingUsersPopupDisplay: boolean

  // アカウントレポート送信ポップアッププロパティ
  sendAccountReportPopupProps: {
    display: boolean
    user?: TTUser
  }

  // ポストレポート送信ポップアッププロパティ
  sendPostReportPopupProps: {
    display: boolean
    post?: TTPost
  }

  // D&D
  isDragOver: boolean

  $setI18n?: Function
  $getI18n?: Function

  formatDate: Function
  forceUpdate: () => void
  fetchUserProfile: () => Promise<void>
  fetchCurrentProfile: (handle: string) => Promise<void>
  fetchCurrentAuthorFeed: (direction: "new" | "old") => Promise<void>
  fetchAuthorReposts: (direction: "new" | "old") => Promise<void>
  fetchAuthorLikes: (direction: "new" | "old") => Promise<void>
  fetchTimeline: (direction: "old" | "new") => Promise<void>
  fetchPostThread: () => Promise<void>
  fetchNotifications: (limit: number, direction: "new" | "old") => Promise<void>
  fetchFollowers: (direction: "new" | "old") => Promise<void>
  fetchFollowings: (direction: "new" | "old") => Promise<void>
  fetchSuggestions: (direction: "new" | "old") => Promise<void>
  updateUserProfile: (profile: TTUpdateProfileParams) => Promise<void>
  openSendPostPopup: (
    type: TTPostType,
    post?: TTPost,
    text?: string,
    fileList?: FileList
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

  // 通知ポップアップの開閉
  openNotificationPopup: Function
  closeNotificationPopup: Function

  // 設定ポップアップの開閉
  openSettingsPopup: Function
  closeSettingsPopup: Function

  // アカウントポップアップの開閉
  openAccountPopup: Function
  closeAccountPopup: Function

  // コンテンツ言語ポップアップの開閉
  openContentLanguagesPopup: Function
  closeContentLanguagesPopup: Function

  // ポスト言語ポップアップの開閉
  openPostLanguagesPopup: Function
  closePostLanguagesPopup: Function

  // 招待コード確認ポップアップの開閉
  openInviteCodesPopup: Function
  closeInviteCodesPopup: Function

  // マイフィードポップアップの開閉
  openMyFeedsPopup: Function
  closeMyFeedsPopup: Function

  // 人気のフィードポップアップの開閉
  openPopularFeedsPopup: Function
  closePopularFeedsPopup: Function

  // ワードミュートポップアップの開閉
  openWordMutePopup: Function
  closeWordMutePopup: Function

  // コンテンツフィルタリングポップアップの開閉
  openContentFilteringPopup: Function
  closeContentFilteringPopup: Function

  // ミュートユーザーリストポップアップの開閉
  openMutingUsersPopup: Function
  closeMutingUsersPopup: Function

  // ブロックユーザーリストポップアップの開閉
  openBlockingUsersPopup: Function
  closeBlockingUsersPopup: Function

  // アカウントレポート送信ポップアップの開閉
  openSendAccountReportPopup: Function
  closeSendAccountReportPopup: Function

  // ポストレポート送信ポップアップの開閉
  openSendPostReportPopup: Function
  closeSendPostReportPopup: Function

  // エラーポップアップの開閉
  openErrorPopup: Function
  closeErrorPopup: Function

  // ブロードキャスト
  broadcastChannel: BroadcastChannel
}
