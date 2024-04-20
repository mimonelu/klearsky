type MainState = {
  $setCurrentLanguage?: Function
  $getCurrentLanguage?: Function
  atp: TIAtpWrapper
  currentPath: string
  currentQuery: LocationQuery
  loaderDisplay: boolean
  centerLoaderDisplay: boolean
  listLoaderDisplay: boolean
  mounted: boolean
  updateKey: number
  forceUpdate: () => void
  formatDate: (dateString?: string) => string
  updatePageTitle: () => void

  // MyWorker
  myWorker: TTMyWorker

  // D&D
  isDragOver: boolean

  // インフィニットスクロール用プロパティ
  scrolledToBottom: boolean

  // ブロードキャスト
  broadcastChannel?: BroadcastChannel

  // 現在のサーバ情報

  currentServerInfo?: TTServerInfo
  fetchCurrentServerInfo: () => void

  // 設定

  settings: { [did: string]: TTSetting }
  backgroundImage: ComputedRef<string>
  currentSetting: TTSetting
  resetSettings: () => void
  updateSettings: () => void
  saveSettings: () => void
  updateCurrentLanguageSetting: () => void
  updateColorThemeSetting: () => void

  // 設定 - 設定ポップオーバー

  settingsPopoverDisplay: boolean
  settingsPopoverSelector: string
  settingsPopoverDirection: "toRight" | "toUp"
  openSettingsPopover: Function
  closeSettingsPopover: Function

  // 設定 - UI言語設定ポップアップ

  uiLanguageSettingsPopupDisplay: boolean
  openUiLanguageSettingsPopup: Function
  closeUiLanguageSettingsPopup: Function

  // 設定 - デザイン設定ポップアップ

  designSettingsPopupDisplay: boolean
  openDesignSettingsPopup: Function
  closeDesignSettingsPopup: Function

  // 設定 - ポスト設定ポップアップ

  postSettingsPopupDisplay: boolean
  openPostSettingsPopup: Function
  closePostSettingsPopup: Function

  // 設定 - 心理的安全性設定ポップアップ

  psySafetySettingsPopupDisplay: boolean
  openPsySafetySettingsPopup: Function
  closePsySafetySettingsPopup: Function

  // 設定 - その他設定ポップアップ

  otherSettingsPopupDisplay: boolean
  openOtherSettingsPopup: Function
  closeOtherSettingsPopup: Function

  // 設定 - 説明用ポップアップ

  htmlPopupDisplay: boolean
  htmlPopupType?: string

  // 設定 - 招待コードポップアップ

  inviteCodesPopupDisplay: boolean
  openInviteCodesPopup: Function
  closeInviteCodesPopup: Function

  // 通知

  notifications: Array<TTNotificationGroup>
  notificationCursor?: string
  notificationCount: number
  notificationFetchedFirst: boolean
  notificationPopupDisplay: boolean
  notificationReasonFilter?: TTNotificationReason
  fetchNotifications: (limit: number, direction: "new" | "old") => Promise<void>
  openNotificationPopup: Function
  closeNotificationPopup: Function

  // 通知タイマー

  notificationTimer: null | number = null
  clearNotificationInterval: () => void
  updateNotifications: () => Promise<void>
  updateNotificationInterval: () => void

  // 招待コード

  inviteCodes: Array<TTInviteCode>
  numberOfInviteCodes: ComputedRef<number>
  numberOfAvailableInviteCodes: ComputedRef<number>
  updateInviteCodes: () => Promise<boolean>

  // Preferences

  currentPreferences: Array<TTPreference>
  fetchPreferences: () => Promise<boolean>

  // コンテンツフィルタ

  getContentWarningVisibility: (labels?: Array<TTLabel>) => TTContentVisibility
  getConcernedPreferences: (labels?: Array<TTLabel>) => Array<TTPreference>

  // ラベル

  hasLabel (target: string, labels?: Array<TTLabel>): boolean
  getCustomLabels (labels?: Array<TTLabel>): Array<TTLabel>
  filterLabels (
    visibilities?: Array<TTContentVisibility>,
    warns?: Array<TTLabelOnWarn>,
    labels?: Array<TTLabel>
  ): Array<TTLabel>
  selectLabelsPopupDisplay: boolean
  selectLabelsPopupState: any
  openSelectLabelsPopup: Function
  closeSelectLabelsPopup: Function

  // ミュートユーザー

  currentMutingUsers: Array<TTUser>
  currentMutingUsersCursor?: string

  // ブロックユーザー

  currentBlockingUsers: Array<TTUser>
  currentBlockingUsersCursor?: string

  // プロフィール

  inSameProfilePage: boolean
  profileFolding: boolean
  currentProfile: null | TTProfile
  currentAuthorFeeds: Array<TTFeed>
  currentAuthorFeedsCursor?: string
  currentAuthorFeedsWithReplies: Array<TTFeed>
  currentAuthorFeedsWithRepliesCursor?: string
  currentAuthorFeedsWithMedia: Array<TTFeed>
  currentAuthorFeedsWithMediaCursor?: string
  currentAuthorCustomFeeds: Array<TTFeedGenerator>
  currentAuthorCustomFeedsCursor?: string
  currentAuthorReposts: Array<TTFeed>
  currentAuthorRepostsCursor?: string
  currentAuthorLikes: Array<TTFeed>
  currentAuthorLikesCursor?: string
  currentAuthorLists: Array<TTList>
  currentAuthorListsCursor?: string
  currentFollowers: Array<TTUser>
  currentFollowersCursor?: string
  currentFollowings: Array<TTUser>
  currentFollowingsCursor?: string
  currentSuggestedFollows: Array<TTUser>
  userProfile: null | TTProfile
  isMyProfile: () => boolean
  fetchUserProfile: () => Promise<void>
  updateUserProfile: (profile: TTUpdateProfileParams) => Promise<void>
  fetchCurrentProfile: (did: string) => Promise<void>
  fetchCurrentAuthorCustomFeeds: (direction: "new" | "old") => Promise<void>
  fetchCurrentAuthorFeed: (direction: TTDirection, filter?: string, middleCursor?: string) => Promise<void>
  fetchAuthorReposts: (direction: TTDirection) => Promise<void>
  fetchAuthorLikes: (direction: TTDirection) => Promise<void>
  fetchAuthorLists: (direction: "new" | "old") => Promise<void>
  fetchFollowers: (direction: "new" | "old") => Promise<void>
  fetchFollowings: (direction: "new" | "old") => Promise<void>
  fetchSuggestedFollows: () => Promise<void>
  fetchSuggestions: (direction: "new" | "old") => Promise<void>

  // ポストスレッド

  currentPosts: Array<TTPost>
  fetchPostThread: () => Promise<void>

  // フォロー中フィード

  timelineFeeds: Array<TTFeed>
  timelineCursor?: string
  fetchTimeline: (direction: TTDirection, middleCursor?: string) => Promise<void>

  // 検索

  // 検索 - 現在の検索キーワード
  currentSearchTerm: string

  // 検索 - 現在のポスト検索結果
  currentSearchPostResults: Array<TTPost>
  currentSearchPostCursor?: string
  currentSearchPostsLastTerm?: string
  fetchSearchPosts: (cursor?: string) => Promise<void>

  // 検索 - 現在のフィード検索結果
  currentSearchFeeds: Array<TTFeedGenerator>
  currentSearchFeedsCursor?: string
  currentSearchFeedsLastTerm?: string
  fetchSearchFeeds: (direction: "new" | "old") => Promise<void>

  // 検索 - 現在のおすすめユーザー検索結果
  currentSearchSuggestionResults: Array<TTUser>
  currentSearchSuggestionCursor?: string

  // 検索 - 現在のユーザー検索結果
  currentSearchUsers: Array<TTUser>
  currentSearchUsersCursor?: string
  currentSearchLastUserTerm?: string

  // 検索 - タグ付けされた提案
  currentTaggedSuggestions: TITaggedSuggestion[]
  currentTaggedProfiles: { [did: string]: null | TTProfile }

  // カスタムフィード

  currentCustomUri?: string
  currentCustomFeeds: Array<TTFeed>
  currentCustomCursor?: string
  currentPopularFeedGenerators: Array<TTFeedGenerator>
  currentPopularFeedGeneratorsCursor?: string
  feedPreferences: ComputedRef<undefined | TTPreference>
  fetchCustomFeeds: (direction: TTDirection, middleCursor?: string) => Promise<void>
  fetchPopularFeedGenerators: (direction: "new" | "old") => Promise<void>
  sortFeedPreferencesSavedAndPinned: () => void

  // マイフィード
  myFeeds: TTMyFeeds

  // リスト

  currentList?: TTList
  currentListItems: Array<TTListItem>
  currentListItemsCursor?: string
  currentListFeeds: Array<TTFeed>
  currentListFeedsCursor?: string
  fetchCurrentList: (listUri: string) => Promise<boolean>
  fetchCurrentListItems: (direction: "old" | "new") => Promise<boolean>
  fetchCurrentListFeeds: (direction: TTDirection, middleCursor?: string) => Promise<boolean>

  // マイリスト

  myLists: TTMyLists

  // グローバルライン

  globallinePosts: Array<TTPost>
  globallineProfiles: { [did: string]: any }
  globallineNumberOfPosts: number

  // ポップオーバー

  // ポップオーバー - プロフィールポップオーバー

  profilePopoverProps: {
    display: boolean
    isUser: boolean
    user?: TTUser
  }
  profilePopoverSelector?: string | HTMLElement
  openProfilePopover: Function
  closeProfilePopover: Function

  // ポップオーバー - フィードカードポップオーバー

  feedCardPopoverProps: {
    display: boolean
    generator?: TTFeedGenerator
  }
  feedCardPopoverSelector?: string | HTMLElement
  openFeedCardPopover: Function
  closeFeedCardPopover: Function

  // ポップアップ

  // ポップアップ - エラーポップアップ
  errorPopupProps: {
    display: boolean
    error: any
    description: any
  }
  openErrorPopup: (error: any, description: any) => void
  closeErrorPopup: Function

  // ポップアップ - メッセージポップアップ
  messagePopupProps: TTMessagePopupProps
  openMessagePopup: (params: Omit<TTMessagePopupProps, "display">) => void
  closeMessagePopup: () => void

  // ポップアップ - 確認ポップアップ
  confirmationPopupDisplay: boolean
  confirmationPopupTitle?: string
  confirmationPopupText?: string
  confirmationPopupDetail?: string
  confirmationPopupResult: boolean
  openConfirmationPopup: (title?: string, text?: string, detail?: string) => Promise<boolean>
  closeConfirmationPopup: () => void
  applyConfirmationPopup: () => void

  // ポップアップ - ログインポップアップ
  loginPopupDisplay: boolean
  loginPopupAutoDisplay: ComputedRef<boolean>

  // ポップアップ - アカウントポップアップ
  accountPopupDisplay: boolean
  openAccountPopup: Function
  closeAccountPopup: Function

  // ポップアップ - コンテンツ言語ポップアップ
  contentLanguagesPopupDisplay: boolean
  openContentLanguagesPopup: Function
  closeContentLanguagesPopup: Function

  // ポップアップ - ポスト言語ポップアップ
  postLanguagesPopupDisplay: boolean
  openPostLanguagesPopup: Function
  closePostLanguagesPopup: Function

  // ポップアップ - コンテンツフィルタリングポップアップ
  contentFilteringPopupDisplay: boolean
  openContentFilteringPopup: Function
  closeContentFilteringPopup: Function

  // ポップアップ - ミュートユーザーリストポップアップ
  mutingUsersPopupDisplay: boolean
  openMutingUsersPopup: Function
  closeMutingUsersPopup: Function

  // ポップアップ - ブロックユーザーリストポップアップ
  blockingUsersPopupDisplay: boolean
  openBlockingUsersPopup: Function
  closeBlockingUsersPopup: Function

  // ポップアップ - ワードミュートポップアップ
  wordMutePopupDisplay: boolean
  openWordMutePopup: Function
  closeWordMutePopup: Function

  // ポップアップ - アカウントレポート送信ポップアップ
  sendAccountReportPopupProps: {
    display: boolean
    user?: TTUser
  }
  openSendAccountReportPopup: Function
  closeSendAccountReportPopup: Function

  // ポップアップ - ポストレポート送信ポップアップ
  sendPostReportPopupProps: {
    display: boolean
    post?: TTPost
  }
  openSendPostReportPopup: Function
  closeSendPostReportPopup: Function

  // ポップアップ - フィードレポート送信ポップアップ
  sendFeedReportPopupProps: {
    display: boolean
    generator?: TTFeedGenerator
  }
  openSendFeedReportPopup: Function
  closeSendFeedReportPopup: Function

  // ポップアップ - リストレポート送信ポップアップ
  sendListReportPopupProps: {
    display: boolean
    list?: TTList
  }
  openSendListReportPopup: Function
  closeSendListReportPopup: Function

  // ポップアップ - イメージポップアップ
  imagePopupProps: {
    display: boolean
    did: string
    images: TTImagePopupPropsImages[]
    alts: string[]
    index: number
  }

  // ポップアップ - リポストユーザーポップアップ
  currentRepostUsers: Array<TTUser>
  currentRepostUsersUri?: string
  currentRepostUsersCursor?: string
  repostUsersPopupDisplay: boolean
  openRepostUsersPopup: (uri: string) => void
  closeRepostUsersPopup: () => void

  // ポップアップ - いいねユーザーポップアップ
  currentLikeUsers: Array<TTUser>
  currentLikeUsersUri?: string
  currentLikeUsersCursor?: string
  likeUsersPopupDisplay: boolean
  openLikeUsersPopup: (uri: string) => void
  closeLikeUsersPopup: () => void

  // ポップアップ - マイフィードポップアップ
  myFeedsPopupDisplay: boolean
  openMyFeedsPopup: Function
  closeMyFeedsPopup: Function

  // ポップアップ - マイリストポップアップ
  myListPopupDisplay: boolean
  openMyListPopup: Function
  closeMyListPopup: Function

  // ポップアップ - リスト編集ポップアップ
  listEditPopupProps: TTListEditPopupProps
  openListEditPopup: Function
  closeListEditPopup: Function

  // ポップアップ - リストユーザー管理ポップアップ
  listUserManagementPopupProps: TTListUserManagementPopupProps
  openListUserManagementPopup: Function
  closeListUserManagementPopup: Function

  // ポップアップ - タイムフィードポップアップ
  currentTimeFeeds: Array<TTPost>
  timeFeedsPopupDisplay: boolean
  timeFeedsPopupProps?: {
    targetPost: TTPost
    direction: "old" | "new"
  }
  openTimeFeedsPopup: (post: TTPost, direction: "old" | "new") => void
  closeTimeFeedsPopup: () => void

  // ポップアップ - ポスト送信ポップアップ
  sendPostPopupProps: TTSendPostPopupParams
  openSendPostPopup: (params: TTSendPostPopupParams) => Promise<boolean>
  closeSendPostPopup: (done: boolean, hidden: boolean) => void

  // ポップアップ - マイタグポップアップ
  currentPostTags: Array<TTTag>
  myTagPopupProps: TTTagPopupProps
  openMyTagPopup: Function
  closeMyTagPopup: Function

  // ポップアップ - ポスト日時選択ポップアップ
  postDatePopupDisplay: boolean
  postDatePopupDate?: string
  openPostDatePopup: Function
  closePostDatePopup: Function

  // ポップアップ - Threadgate ポップアップ
  threadgatePopupProps: TTThreadgatePopupProps
  openThreadgatePopup: Function
  closeThreadgatePopup: Function

  // ポップアップ - 進捗ポップアップ
  progressPopupDisplay: boolean
  progressPopupProps: {
    value: number
    message?: string
  }
  openProgressPopup: Function
  closeProgressPopup: Function
}
