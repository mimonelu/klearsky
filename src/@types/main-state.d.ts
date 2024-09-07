type MainState = {
  $setCurrentLanguage?: Function
  $getCurrentLanguage?: Function
  atp: TIAtpWrapper
  currentPath: string
  currentQuery: LocationQuery
  mounted: boolean
  loaderDisplay: boolean
  centerLoaderDisplay: boolean
  listLoaderDisplay: boolean
  updateKey: number
  forceUpdate: () => void
  formatDate: (dateString?: string) => string
  updatePageTitle: () => void

  // MyWorker
  myWorker: TIMyWorker

  // D&D
  isDragOver: boolean

  // インフィニットスクロール用プロパティ
  scrolledToBottom: boolean

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

  // 通知
  notifications: Array<TTNotificationGroup>
  notificationCursor?: string
  notificationCount: number
  notificationFetchedFirst: boolean
  notificationReasonFilter?: TTNotificationReason
  lastFetchNotificationsDate?: Date
  fetchNotifications: (limit: number, direction: "new" | "old") => Promise<void>

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

  // プリファレンス
  currentPreferences: Array<TTPreference>
  fetchPreferences: () => Promise<boolean>

  // ラベル
  hasLabel (target: string, labels?: Array<TTLabel>): boolean
  getHarmfulLabels (labels?: Array<TTLabel>): Array<TTLabel>
  getLabelerLabels (labels?: Array<TTLabel>): Array<TTLabel>
  getCustomLabels (labels?: Array<TTLabel>): Array<TTLabel>

  // ラベラー
  myLabeler: TIMyLabeler
  currentLabeler?: TILabeler

  // チャット
  myChat: TIMyChat
  chatListTimer: undefined | any
  endChatListTimer: () => void
  startChatListTimer: () => void

  // ミュートユーザー
  currentMutingUsers: Array<TTUser>
  currentMutingUsersCursor?: string

  // ブロックユーザー
  currentBlockingUsers: Array<TTUser>
  currentBlockingUsersCursor?: string

  // プロフィール
  inSameProfilePage: boolean
  profileFolding: boolean
  userProfile: null | TTProfile
  currentProfile: null | TTProfile
  // -------------------------------- resetProfileState() 対象エリア
  currentAuthorFeeds: Array<TTFeed>
  currentAuthorFeedsCursor?: string
  currentAuthorFeedsWithReplies: Array<TTFeed>
  currentAuthorFeedsWithRepliesCursor?: string
  currentAuthorFeedsWithMedia: Array<TTFeed>
  currentAuthorFeedsWithMediaCursor?: string
  currentAuthorFeedGenerators: Array<TTFeedGenerator>
  currentAuthorFeedGeneratorsCursor?: string
  currentAuthorReposts: Array<TTFeed>
  currentAuthorRepostsCursor?: string
  currentAuthorLikes: Array<TTFeed>
  currentAuthorLikesCursor?: string
  currentAuthorLists: Array<TTList>
  currentAuthorListsCursor?: string
  currentAuthorPinnedPost?: TTPost
  currentAuthorStarterPacks: Array<TIStarterPack>
  currentAuthorStarterPacksCursor?: string
  currentFollowers: Array<TTUser>
  currentFollowersCursor?: string
  currentFollowings: Array<TTUser>
  currentFollowingsCursor?: string
  currentSuggestedFollows: Array<TTUser>
  // -------------------------------- resetProfileState() 対象エリア
  resetProfileState: () => void
  isMyProfile: () => boolean
  fetchUserProfile: () => Promise<void>
  updateUserProfile: (profile: TTUpdateProfileParams) => Promise<void>
  fetchCurrentProfile: (did: string) => Promise<undefined | Error>
  fetchCurrentAuthorFeedGenerators: (direction: "new" | "old") => Promise<void>
  fetchCurrentAuthorFeed: (direction: TTDirection, filter?: string, middleCursor?: string) => Promise<void>
  fetchAuthorReposts: (direction: TTDirection) => Promise<void>
  fetchAuthorLikes: (direction: TTDirection) => Promise<void>
  fetchAuthorLists: (direction: "new" | "old") => Promise<void>
  fetchAuthorStarterPacks: (direction: "new" | "old") => Promise<void>
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

  // 検索 - 現在のポスト検索フォーム
  currentSearchPostFormState: {
    sort: "top" | "latest"
    lang?: Array<string>
    author?: Array<string>
  }

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

  // 検索 - トレンドタグ
  currentTrendTags: Array<TITrendTag>

  // カスタムフィード
  currentCustomFeedsUri?: string
  currentCustomFeeds: Array<TTFeed>
  currentCustomFeedsCursor?: string
  currentPopularFeedGenerators: Array<TTFeedGenerator>
  currentPopularFeedGeneratorsCursor?: string
  currentFeedPreference: ComputedRef<undefined | TTPreference>
  fetchCustomFeeds: (direction: TTDirection, middleCursor?: string) => Promise<void>
  fetchPopularFeedGenerators: (direction: "new" | "old") => Promise<void>
  sortFeedPreferencesSavedAndPinned: () => void
  removeFeedPreferenceByUri: (type: TTPreferenceFeedType, uri: string) => boolean

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

  // スターターパック
  currentStarterPack?: TIStarterPack
  currentStarterPackListFeeds: Array<TTFeed>
  currentStarterPackListFeedsCursor?: string
  fetchCurrentStarterPackListFeeds: (direction: TTDirection, middleCursor?: string) => Promise<boolean>

  // グローバルフィード
  globallinePosts: Array<TTPost>
  globallineProfiles: { [did: string]: any }
  globallineNumberOfPosts: number

  // ポップオーバー

  // ポップオーバー - 設定ポップオーバー
  settingsPopoverDisplay: boolean
  settingsPopoverSelector: string
  settingsPopoverDirection: "toRight" | "toUp"
  openSettingsPopover: Function
  closeSettingsPopover: Function

  // ポップオーバー - プロフィールポップオーバー
  profilePopoverProps: {
    display: boolean
    isUser: boolean
    user?: TTUser
  }
  profilePopoverSelector?: string | HTMLElement
  profilePopoverFrom?: string
  openProfilePopover: Function
  closeProfilePopover: Function

  // ポップオーバー - ポストポップオーバー
  postPopoverProps: {
    display: boolean
    post?: TTPost
  }
  postPopoverSelector?: string | HTMLElement
  postPopoverCallback?: (type: "deletePost" | "updatePost") => Promise<void>
  openPostPopover: Function
  closePostPopover: Function

  // ポップオーバー - フィードカードポップオーバー
  feedCardPopoverProps: {
    display: boolean
    generator?: TTFeedGenerator
  }
  feedCardPopoverSelector?: string | HTMLElement
  openFeedCardPopover: Function
  closeFeedCardPopover: Function

  // ポップオーバー - リストカードポップオーバー
  listCardPopoverProps: {
    display: boolean
    list?: TTList
  }
  listCardPopoverSelector?: string | HTMLElement
  listCardPopoverCallback?: (type: "startAwait" | "endAwait" | "deleteList") => Promise<void>
  openListCardPopover: Function
  closeListCardPopover: Function

  // ポップオーバー - スターターパックカードポップオーバー
  starterPackCardPopoverProps: {
    display: boolean
    starterPack?: TIStarterPack
  }
  starterPackCardPopoverSelector?: string | HTMLElement
  starterPackCardPopoverCallback?: (type: "startAwait" | "endAwait" | "editStarterPack" | "deleteStarterPack") => Promise<void>
  openStarterPackCardPopover: Function
  closeStarterPackCardPopover: Function

  // ポップオーバー - マイフィードソートポップオーバー
  myFeedsSortPopoverProps: {
    display: boolean
  }
  myFeedsSortPopoverSelector?: string | HTMLElement
  myFeedsSortPopoverCallback?: Function
  openMyFeedsSortPopover: Function
  closeMyFeedsSortPopover: Function

  // ポップオーバー - チャットルームポップオーバー
  chatConvoPopoverProps: {
    display: boolean
    myConvo?: TIMyConvo
  }
  chatConvoPopoverSelector?: string | HTMLElement
  chatConvoPopoverCallback?: Function
  openChatConvoPopover: Function
  closeChatConvoPopover: Function

  // ポップオーバー - チャット公開設定ポップオーバー
  chatDeclarationSelectPopoverProps: {
    display: boolean
  }
  chatDeclarationSelectPopoverSelector?: string | HTMLElement
  chatDeclarationSelectPopoverCallback?: Function
  openChatDeclarationSelectPopover: Function
  closeChatDeclarationSelectPopover: Function

  // ポップオーバー - チャットメッセージポップオーバー
  chatMessagePopoverProps: {
    display: boolean
    myConvo?: TIMyConvo
    message?: TIChatMessage
  }
  chatMessagePopoverSelector?: string | HTMLElement
  chatMessagePopoverCallback?: Function
  openChatMessagePopover: Function
  closeChatMessagePopover: Function

  // ポップオーバー - キーワード履歴ポップオーバー
  keywordHistoryPopoverProps: {
    display: boolean
    kind?: "postSearchKeywordHistory"
    selector?: string | HTMLElement
    keywords: string[]
    callback?: Function
  }
  openKeywordHistoryPopover: Function
  closeKeywordHistoryPopover: Function
  addKeywordHistory: Function

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
  confirmationPopupProps: TIConfirmationPopupProps
  openConfirmationPopup: (params: Omit<TIConfirmationPopupProps, "display" | "result">) => Promise<boolean>
  closeConfirmationPopup: () => void
  applyConfirmationPopup: () => void

  // ポップアップ - ログインポップアップ
  loginPopupDisplay: boolean
  loginPopupAutoDisplay: ComputedRef<boolean>

  // ポップアップ - アカウントポップアップ
  accountPopupDisplay: boolean
  openAccountPopup: Function
  closeAccountPopup: Function

  // ポップアップ - 通知ポップアップ
  notificationPopupDisplay: boolean
  openNotificationPopup: Function
  closeNotificationPopup: Function

  // ポップアップ - UI言語設定ポップアップ
  uiLanguageSettingsPopupDisplay: boolean
  openUiLanguageSettingsPopup: Function
  closeUiLanguageSettingsPopup: Function

  // ポップアップ - デザイン設定ポップアップ
  designSettingsPopupDisplay: boolean
  openDesignSettingsPopup: Function
  closeDesignSettingsPopup: Function

  // ポップアップ - ポスト設定ポップアップ
  postSettingsPopupDisplay: boolean
  openPostSettingsPopup: Function
  closePostSettingsPopup: Function

  // ポップアップ - 心理的安全性設定ポップアップ
  psySafetySettingsPopupDisplay: boolean
  openPsySafetySettingsPopup: Function
  closePsySafetySettingsPopup: Function

  // ポップアップ - その他設定ポップアップ
  otherSettingsPopupDisplay: boolean
  openOtherSettingsPopup: Function
  closeOtherSettingsPopup: Function

  // ポップアップ - 説明用ポップアップ
  htmlPopupDisplay: boolean
  htmlPopupType?: string

  // ポップアップ - 招待コードポップアップ
  inviteCodesPopupDisplay: boolean
  openInviteCodesPopup: Function
  closeInviteCodesPopup: Function

  // ポップアップ - コンテンツ言語ポップアップ
  contentLanguagesPopupDisplay: boolean
  openContentLanguagesPopup: Function
  closeContentLanguagesPopup: Function

  // ポップアップ - ポスト言語ポップアップ
  postLanguagesPopupDisplay: boolean
  openPostLanguagesPopup: Function
  closePostLanguagesPopup: Function

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

  // ポップアップ - チャット一覧ポップアップ
  chatListPopupProps: {
    display: boolean
  }
  openChatListPopup: Function
  closeChatListPopup: Function

  // ポップアップ - チャットルームポップアップ
  chatConvoPopupProps: {
    display: boolean
    myConvo?: TIMyConvo
  }
  openChatConvoPopup: Function
  closeChatConvoPopup: Function

  // ポップアップ - チャットメンバー選択ポップアップ
  chatMembersSelectPopupProps: {
    display: boolean
    users: Array<TTUser>
    limit: number
  }
  openChatMembersSelectPopup: Function
  closeChatMembersSelectPopup: Function

  // ポップアップ - ラベラー一覧ポップアップ
  labelerListPopupProps: {
    display: boolean
    title: string
    labelers: Array<TILabeler>
  }
  openLabelerListPopup: Function
  closeLabelerListPopup: Function

  //ポップアップ - 　ラベラー設定ポップアップ
  labelerSettingsPopupProps: {
    display: boolean
    labeler?: TILabeler
  }
  openLabelerSettingsPopup: Function
  closeLabelerSettingsPopup: Function

  // ポップアップ - ラベル選択ポップアップ
  selectLabelsPopupDisplay: boolean
  selectLabelsPopupState: any
  openSelectLabelsPopup: Function
  closeSelectLabelsPopup: Function

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

  // ポップアップ - 引用リポスト一覧ポップアップ
  currentQuoteReposts: Array<TTPost>
  currentQuoteRepostsUri?: string
  currentQuoteRepostsCursor?: string
  quoteRepostsPopupDisplay: boolean
  openQuoteRepostsPopup: (uri: string) => void
  closeQuoteRepostsPopup: () => void

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

  // ポップアップ - スターターパック編集ポップアップ
  starterPackEditPopupProps: TIStarterPackEditPopupProps
  openStarterPackEditPopup: (props: TIStarterPackEditPopupProps) => void
  closeStarterPackEditPopup: Function

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
  sendPostPopupProcessing: boolean
  openSendPostPopup: (params?: TTSendPostPopupParams) => Promise<boolean>
  closeSendPostPopup: (done: boolean, hidden: boolean) => void

  // ポップアップ - マイタグポップアップ
  currentPostTags: Array<TTTag>
  myTagPopupProps: TTTagPopupProps
  openMyTagPopup: Function
  closeMyTagPopup: Function

  // ポップアップ - ポスト日時選択ポップアップ
  postDatePopupDisplay: boolean
  postDatePopupDate?: string
  openPostDatePopup: (payload: MouseEvent) => void
  closePostDatePopup: Function

  // ポップアップ - Threadgate ポップアップ
  threadgatePopupProps: TTThreadgatePopupProps
  openThreadgatePopup: Function
  closeThreadgatePopup: Function

  // ポップアップ - リストメンションポップアップ
  listMentionPopupProps: TIListMentionPopupProps
  openListMentionPopup: Function
  closeListMentionPopup: Function

  // ポップアップ - HTML ポップアップ
  htmlPopupProps: TTHtmlPopupProps
  openHtmlPopup: Function
  closeHtmlPopup: Function

  // ポップアップ - 進捗ポップアップ
  progressPopupDisplay: boolean
  progressPopupProps: {
    value: number
    message?: string
  }
  openProgressPopup: Function
  closeProgressPopup: Function
}
