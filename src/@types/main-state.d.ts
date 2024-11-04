interface MainState {
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
  formatDate: (dateString?: string, absoluteNotation?: boolean) => string
  updatePageTitle: () => void
  attachFilesToPost: (this: MainState, items: DataTransferItemList) => boolean

  // MyWorker
  myWorker?: TIMyWorker

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

  // 新着通知タイマー
  notificationTimer: null | NodeJS.Timeout = null
  clearNotificationInterval: () => void
  updateNotifications: () => Promise<void>
  updateNotificationInterval: () => void

  // 新着フォロー中フィードタイマー
  hasTimelineNewArrival: boolean
  timelineTimer: null | NodeJS.Timeout = null
  clearTimelineInterval: () => void
  updateTimeline: () => Promise<void>
  updateTimelineInterval: () => void

  // 招待コード
  inviteCodes: Array<TTInviteCode>
  numberOfInviteCodes: ComputedRef<number>
  numberOfAvailableInviteCodes: ComputedRef<number>
  updateInviteCodes: () => Promise<boolean>

  // プリファレンス
  currentPreferences: Array<TTPreference>
  fetchPreferences: () => Promise<boolean>
  updatePreferences: () => Promise<boolean>

  // ラベル
  hasLabel (target: string, labels?: Array<TTLabel>): boolean
  getHarmfulLabels (labels?: Array<TTLabel>): Array<TTLabel>
  getLabelerLabels (labels?: Array<TTLabel>): Array<TTLabel>
  getCustomLabels (labels?: Array<TTLabel>): Array<TTLabel>

  // ラベラー
  myLabeler?: TIMyLabeler
  currentLabeler?: TILabeler

  // チャット
  myChat?: TIMyChat
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
  currentAuthorPostOfPinnedPost?: TTPost
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
  fetchCurrentProfile: (did: string) => Promise<Error | undefined>
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
  currentFeedPreference: ComputedRef<undefined | TTPreferenceCustomFeedV1>
  fetchCustomFeeds: (direction: TTDirection, middleCursor?: string) => Promise<void>
  fetchPopularFeedGenerators: (direction: "new" | "old") => Promise<void>
  sortFeedPreferencesSavedAndPinned: () => void
  removeFeedPreferenceByUri: (type: TTPreferenceFeedType, uri: string) => boolean

  // マイフィード
  myFeeds?: TTMyFeeds

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
  myLists?: TTMyLists

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
  closeSettingsPopover: () => void

  // ポップオーバー - プロフィールポップオーバー
  profilePopoverProps: {
    display: boolean
    isUser: boolean
    user?: TTUser
  }
  profilePopoverSelector?: string | HTMLElement
  profilePopoverFrom?: string
  openProfilePopover: Function
  closeProfilePopover: () => void

  // ポップオーバー - ポストポップオーバー
  postPopoverProps: {
    display: boolean
    post?: TTPost
  }
  postPopoverSelector?: string | HTMLElement
  postPopoverCallback?: (type: "deletePost" | "updatePost" | "createCustomBookmark" | "deleteCustomBookmark") => Promise<void>
  openPostPopover: Function
  closePostPopover: () => void

  // ポップオーバー - フィードカードポップオーバー
  feedCardPopoverProps: {
    display: boolean
    generator?: TTFeedGenerator
  }
  feedCardPopoverSelector?: string | HTMLElement
  openFeedCardPopover: Function
  closeFeedCardPopover: () => void

  // ポップオーバー - リストカードポップオーバー
  listCardPopoverProps: {
    display: boolean
    list?: TTList
  }
  listCardPopoverSelector?: string | HTMLElement
  listCardPopoverCallback?: (type: "startAwait" | "endAwait" | "deleteList") => Promise<void>
  openListCardPopover: Function
  closeListCardPopover: () => void

  // ポップオーバー - スターターパックカードポップオーバー
  starterPackCardPopoverProps: {
    display: boolean
    starterPack?: TIStarterPack
  }
  starterPackCardPopoverSelector?: string | HTMLElement
  starterPackCardPopoverCallback?: (type: "startAwait" | "endAwait" | "editStarterPack" | "deleteStarterPack") => Promise<void>
  openStarterPackCardPopover: Function
  closeStarterPackCardPopover: () => void

  // ポップオーバー - マイフィードソートポップオーバー
  myFeedsSortPopoverProps: {
    display: boolean
  }
  myFeedsSortPopoverSelector?: string | HTMLElement
  myFeedsSortPopoverCallback?: Function
  openMyFeedsSortPopover: Function
  closeMyFeedsSortPopover: () => void

  // ポップオーバー - チャットルームポップオーバー
  chatConvoPopoverProps: {
    display: boolean
    myConvo?: TIMyConvo
  }
  chatConvoPopoverSelector?: string | HTMLElement
  chatConvoPopoverCallback?: Function
  openChatConvoPopover: Function
  closeChatConvoPopover: () => void

  // ポップオーバー - チャット公開設定ポップオーバー
  chatDeclarationSelectPopoverProps: {
    display: boolean
  }
  chatDeclarationSelectPopoverSelector?: string | HTMLElement
  chatDeclarationSelectPopoverCallback?: Function
  openChatDeclarationSelectPopover: Function
  closeChatDeclarationSelectPopover: () => void

  // ポップオーバー - チャットメッセージポップオーバー
  chatMessagePopoverProps: {
    display: boolean
    myConvo?: TIMyConvo
    message?: TIChatMessage
  }
  chatMessagePopoverSelector?: string | HTMLElement
  chatMessagePopoverCallback?: Function
  openChatMessagePopover: Function
  closeChatMessagePopover: () => void

  // ポップオーバー - キーワード履歴ポップオーバー
  keywordHistoryPopoverProps: {
    display: boolean
    kind?: "postSearchKeywordHistory"
    selector?: string | HTMLElement
    keywords: string[]
    callback?: Function
  }
  openKeywordHistoryPopover: Function
  closeKeywordHistoryPopover: () => void
  addKeywordHistory: Function

  // ポップアップ

  // ポップアップ - エラーポップアップ
  errorPopupProps: {
    display: boolean
    error: any
    description: any
  }
  openErrorPopup: (error: any, description: any) => void
  closeErrorPopup: () => void

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
  closeAccountPopup: () => void

  // ポップアップ - 通知ポップアップ
  notificationPopupDisplay: boolean
  openNotificationPopup: Function
  closeNotificationPopup: () => void

  // ポップアップ - UI言語設定ポップアップ
  uiLanguageSettingsPopupDisplay: boolean
  openUiLanguageSettingsPopup: Function
  closeUiLanguageSettingsPopup: () => void

  // ポップアップ - デザイン設定ポップアップ
  designSettingsPopupDisplay: boolean
  openDesignSettingsPopup: Function
  closeDesignSettingsPopup: () => void

  // ポップアップ - ポスト設定ポップアップ
  postSettingsPopupDisplay: boolean
  openPostSettingsPopup: Function
  closePostSettingsPopup: () => void

  // ポップアップ - 時間設定ポップアップ
  timeSettingsPopupDisplay: boolean
  openTimeSettingsPopup: Function
  closeTimeSettingsPopup: () => void

  // ポップアップ - その他設定ポップアップ
  otherSettingsPopupDisplay: boolean
  openOtherSettingsPopup: Function
  closeOtherSettingsPopup: () => void

  // ポップアップ - 招待コードポップアップ
  inviteCodesPopupDisplay: boolean
  openInviteCodesPopup: Function
  closeInviteCodesPopup: () => void

  // ポップアップ - コンテンツ言語ポップアップ
  contentLanguagesPopupDisplay: boolean
  openContentLanguagesPopup: Function
  closeContentLanguagesPopup: () => void

  // ポップアップ - ポスト言語ポップアップ
  postLanguagesPopupDisplay: boolean
  openPostLanguagesPopup: Function
  closePostLanguagesPopup: () => void

  // ポップアップ - ミュートユーザーリストポップアップ
  mutingUsersPopupDisplay: boolean
  openMutingUsersPopup: Function
  closeMutingUsersPopup: () => void

  // ポップアップ - ブロックユーザーリストポップアップ
  blockingUsersPopupDisplay: boolean
  openBlockingUsersPopup: Function
  closeBlockingUsersPopup: () => void

  // ポップアップ - ワードミュートポップアップ
  wordMutePopupDisplay: boolean
  openWordMutePopup: Function
  closeWordMutePopup: () => void

  // ポップアップ - チャット一覧ポップアップ
  chatListPopupProps: {
    display: boolean
  }
  openChatListPopup: Function
  closeChatListPopup: () => void

  // ポップアップ - チャットルームポップアップ
  chatConvoPopupProps: {
    display: boolean
    myConvo?: TIMyConvo
  }
  openChatConvoPopup: Function
  closeChatConvoPopup: () => void

  // ポップアップ - チャットメンバー選択ポップアップ
  chatMembersSelectPopupProps: {
    display: boolean
    users: Array<TTUser>
    limit: number
  }
  openChatMembersSelectPopup: Function
  closeChatMembersSelectPopup: () => void

  // ポップアップ - ラベラー一覧ポップアップ
  labelerListPopupProps: {
    display: boolean
    title: string
    labelers: Array<TILabeler>
  }
  openLabelerListPopup: Function
  closeLabelerListPopup: () => void

  //ポップアップ - 　ラベラー設定ポップアップ
  labelerSettingsPopupProps: {
    display: boolean
    labeler?: TILabeler
  }
  openLabelerSettingsPopup: Function
  closeLabelerSettingsPopup: () => void

  // ポップアップ - ラベル選択ポップアップ
  selectLabelsPopupDisplay: boolean
  selectLabelsPopupState: any
  openSelectLabelsPopup: Function
  closeSelectLabelsPopup: () => void

  // ポップアップ - アカウントレポート送信ポップアップ
  sendAccountReportPopupProps: {
    display: boolean
    user?: TTUser
  }
  openSendAccountReportPopup: Function
  closeSendAccountReportPopup: () => void

  // ポップアップ - ポストレポート送信ポップアップ
  sendPostReportPopupProps: {
    display: boolean
    post?: TTPost
  }
  openSendPostReportPopup: Function
  closeSendPostReportPopup: () => void

  // ポップアップ - フィードレポート送信ポップアップ
  sendFeedReportPopupProps: {
    display: boolean
    generator?: TTFeedGenerator
  }
  openSendFeedReportPopup: Function
  closeSendFeedReportPopup: () => void

  // ポップアップ - リストレポート送信ポップアップ
  sendListReportPopupProps: {
    display: boolean
    list?: TTList
  }
  openSendListReportPopup: Function
  closeSendListReportPopup: () => void

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
  openMyFeedsPopup: () => void
  closeMyFeedsPopup: () => void

  // ポップアップ - マイリストポップアップ
  myListPopupDisplay: boolean
  openMyListPopup: Function
  closeMyListPopup: () => void

  // ポップアップ - リスト編集ポップアップ
  listEditPopupProps: TTListEditPopupProps
  openListEditPopup: Function
  closeListEditPopup: () => void

  // ポップアップ - リストユーザー管理ポップアップ
  listUserManagementPopupProps: TTListUserManagementPopupProps
  openListUserManagementPopup: Function
  closeListUserManagementPopup: () => void

  // ポップアップ - スターターパック編集ポップアップ
  starterPackEditPopupProps: TIStarterPackEditPopupProps
  openStarterPackEditPopup: (props: TIStarterPackEditPopupProps) => void
  closeStarterPackEditPopup: () => void

  // ポップアップ - タイムフィードポップアップ
  currentTimeFeeds: Array<TTPost>
  timeFeedsPopupDisplay: boolean
  timeFeedsPopupProps?: {
    targetPost: TTPost
    direction: "old" | "new"
  }
  openTimeFeedsPopup: (post: TTPost, direction: "old" | "new") => void
  closeTimeFeedsPopup: () => void

  // ポップアップ - カスタムブックマークポップアップ
  currentCustomBookmarkPacks: Array<TICustomBookmarkPack>
  currentCustomBookmarkPacksCursor?: string
  customBookmarkPopupDisplay: boolean
  openCustomBookmarkPopup: () => void
  closeCustomBookmarkPopup: () => void

  // ポップアップ - カスタムブックマーク管理ポップアップ
  customBookmarkManagementPopupProps: TICustomBookmarkManagementPopupProps
  openCustomBookmarkManagementPopup: Function
  closeCustomBookmarkManagementPopup: () => void

  // ポップアップ - ポスト送信ポップアップ
  sendPostPopupProps: TTSendPostPopupParams
  sendPostPopupProcessing: boolean
  openSendPostPopup: (params?: TTSendPostPopupParams) => Promise<boolean>
  closeSendPostPopup: (done: boolean, hidden: boolean) => void

  // ポップアップ - マイワードポップアップ
  myWordPopupProps: TIMyWordPopupProps
  openMyWordPopup: Function
  closeMyWordPopup: () => void
  myWordPopupCallback?: (myWord: string) => void

// ポップアップ - ポスト日時選択ポップアップ
  postDatePopupDisplay: boolean
  postDatePopupDate?: string
  openPostDatePopup: (payload: MouseEvent) => void
  closePostDatePopup: () => void

  // ポップアップ - 反応制御ポップアップ
  reactionControlPopupProps: TTReactionControlPopupProps
  openReactionControlPopup: Function
  closeReactionControlPopup: (params: TICloseReactionControlPopupProps) => void

  // ポップアップ - リストメンションポップアップ
  listMentionPopupProps: TIListMentionPopupProps
  openListMentionPopup: Function
  closeListMentionPopup: () => void

  // ポップアップ - HTML ポップアップ
  htmlPopupProps: TTHtmlPopupProps
  openHtmlPopup: (type: string) => void
  closeHtmlPopup: () => void

  // ポップアップ - 進捗ポップアップ
  progressPopupDisplay: boolean
  progressPopupProps: {
    value: number
    message?: string
  }
  openProgressPopup: Function
  closeProgressPopup: () => void
}
