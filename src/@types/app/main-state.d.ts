type MainState = {
  $setCurrentLanguage?: Function
  $getCurrentLanguage?: Function
  atp: TIAtpWrapper
  currentPath: string
  currentQuery: LocationQuery
  listProcessing: boolean
  mounted: boolean
  processing: boolean
  updateKey: number
  forceUpdate: () => void
  formatDate: (dateString?: string) => string

  // D&D
  isDragOver: boolean

  // インフィニットスクロール用プロパティ
  scrolledToBottom: boolean

  // ブロードキャスト
  broadcastChannel?: BroadcastChannel

  // 設定

  settings: { [did: string]: TTSetting }
  backgroundImage: ComputedRef<string>
  currentSetting: TTSetting
  settingsPopupDisplay: boolean
  openSettingsPopup: Function
  closeSettingsPopup: Function
  resetSettings: () => void
  updateSettings: () => void
  saveSettings: () => void
  updateCurrentLanguageSetting: () => void
  updateColorThemeSetting: () => void

  // 通知

  notifications: Array<TTNotificationGroup>
  notificationCursor?: string
  notificationCount: number
  notificationFetchedFirst: boolean
  notificationPopupDisplay: boolean
  fetchNotifications: (limit: number, direction: "new" | "old") => Promise<void>
  openNotificationPopup: Function
  closeNotificationPopup: Function

  // 招待コード

  inviteCodes: Array<TTInviteCode>
  numberOfInviteCodes: ComputedRef<number>
  numberOfAvailableInviteCodes: ComputedRef<number>
  inviteCodesPopupDisplay: boolean
  openInviteCodesPopup: Function
  closeInviteCodesPopup: Function

  // Preferences

  currentPreferences: Array<TTPreference>
  fetchPreferences: () => Promise<boolean>

  // コンテンツフィルタ

  getContentWarningVisibility: (labels?: Array<TTLabel>) => TTContentVisibility
  getConcernedPreferences: (labels?: Array<TTLabel>) => Array<TTPreference>

  // ラベル

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
  fetchCurrentAuthorFeed: (direction: "new" | "old", filter?: string, middleCursor?: string) => Promise<void>
  fetchAuthorReposts: (direction: "new" | "old") => Promise<void>
  fetchAuthorLikes: (direction: "new" | "old") => Promise<void>
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
  fetchTimeline: (direction: "old" | "new", middleCursor?: string) => Promise<void>

  // 検索

  // 検索 - 現在の検索キーワード
  currentSearchTerm: string

  // 検索 - 現在のポスト検索結果
  currentSearchPostResults: Array<TTPost>
  currentSearchPostCursor?: string
  currentSearchPostTotal?: number
  currentSearchPostIsLast: boolean
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

  // カスタムフィード

  currentCustomUri?: string
  currentCustomFeeds: Array<TTFeed>
  currentCustomCursor?: string
  currentMyFeeds: { [uri: string]: {
    generator?: TTFeedGenerator
    feeds: Array<TTFeed>
    processing: boolean
    status: boolean
  } }
  currentMyFeedGenerators: Array<TTFeedGenerator>
  currentPopularFeedGenerators: Array<TTFeedGenerator>
  currentPopularFeedGeneratorsCursor?: string
  feedPreferences: ComputedRef<undefined | TTPreference>
  fetchCustomFeeds: (direction: "new" | "old", middleCursor?: string) => Promise<void>
  fetchMyFeedGenerators: () => Promise<void>
  fetchMyFeeds: () => Promise<boolean>
  fetchPopularFeedGenerators: (direction: "new" | "old") => Promise<void>
  sortFeedPreferencesSavedAndPinned: () => void
  sortMyFeedGenerators: () => void

  // リスト

  currentList?: TTList
  currentListItems: Array<TTListItem>
  currentListItemsCursor?: string
  currentListFeeds: Array<TTFeed>
  currentListFeedsCursor?: string
  currentListFeedsUri?: string
  fetchList: (direction: "old" | "new", limit = 1) => Promise<boolean>
  fetchListFeeds: (direction: "old" | "new", middleCursor?: string) => Promise<boolean>

  // リスト - マイリスト

  myList: Array<TTList>
  myListCursor?: string
  fetchMyLists: Function

  // グローバルライン

  globallinePosts: Array<TTPost>
  globallineProfiles: { [did: string]: any }
  globallineNumberOfPosts: number

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

  // ポップアップ - イメージポップアップ
  imagePopupProps: {
    display: boolean
    did: string
    images: Array<TTImagePopupPropsImages>
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

  // ポップアップ - タイムフィードポップアップ
  currentTimeFeeds: Array<TTPost>
  timeFeedsPopupDisplay: boolean
  timeFeedsPopupProps?: TTPost
  openTimeFeedsPopup: (post: TTPost) => void
  closeTimeFeedsPopup: () => void

  // ポップアップ - ポスト送信ポップアップ
  sendPostPopupProps: TTSendPostPopupParams
  openSendPostPopup: (params: TTSendPostPopupParams) => Promise<boolean>
  closeSendPostPopup: (done: boolean) => void

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
}
