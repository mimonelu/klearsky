import endOfYesterday from "date-fns/endOfYesterday"
import format from "date-fns/format"
import intlFormatDistance from "date-fns/intlFormatDistance"
import isSameYear from "date-fns/isSameYear"
import { computed, reactive } from "vue"
import type { LocationQueryValue } from "vue-router"
import AtpWrapper from "@/composables/atp-wrapper"
import attachFilesToPost from "@/composables/main-state/attach-files-to-post"
import MyChat from "@/composables/main-state/my-chat"
import MyFeeds from "@/composables/main-state/my-feeds"
import MyLabeler from "@/composables/main-state/my-labeler"
import MyLists from "@/composables/main-state/my-lists"
import MyWorker from "@/composables/main-state/my-worker"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"
// import LABEL_BEHAVIORS from "@/consts/label-behaviors.json"
import LANGUAGES from "@/consts/languages"

// TODO:
// @ts-ignore
export const state: MainState = reactive<MainState>({
  $setCurrentLanguage: undefined,
  $getCurrentLanguage: undefined,
  atp: new AtpWrapper(),
  currentPath: "",
  currentQuery: {},
  mounted: false,
  loaderDisplay: false,
  centerLoaderDisplay: false,
  listLoaderDisplay: false,
  updateKey: 0,
  forceUpdate: forceUpdate,
  formatDate: formatDate,
  updatePageTitle: () => {}, // updatePageTitle, // TODO:
  attachFilesToPost,

  // MyWorker
  myWorker: undefined,

  // 現在のサーバ情報
  currentServerInfo: undefined,
  fetchCurrentServerInfo: fetchCurrentServerInfo,

  // 設定
  settings: {},
  backgroundImage: computed((): string => {
    if (state.currentSetting?.backgroundImage == null) return ""
    const backgroundImage: string = state.currentSetting.backgroundImage
      .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;")
    return backgroundImage.match(/^\/|^\w+:\/+/)
      ? `url(${backgroundImage})`
      : backgroundImage
  }),
  currentSetting: {},
  resetSettings: resetSettings,
  updateSettings: updateSettings,
  saveSettings: saveSettings,
  updateCurrentLanguageSetting: updateCurrentLanguageSetting,
  updateColorThemeSetting: updateColorThemeSetting,

  // 通知
  notifications: [],
  notificationCursor: undefined,
  notificationCount: 0,
  notificationFetchedFirst: false,
  notificationReasonFilter: undefined,
  lastFetchNotificationsDate: undefined,
  fetchNotifications: fetchNotifications,

  // 新着通知タイマー
  notificationTimer: null,
  clearNotificationInterval,
  updateNotifications,
  updateNotificationInterval,

  // 新着フォロー中フィードタイマー
  hasTimelineNewArrival: false,
  timelineTimer: null,
  clearTimelineInterval,
  updateTimeline,
  updateTimelineInterval,

  // 招待コード
  inviteCodes: [],
  numberOfInviteCodes: computed(() => {
    let total = 0
    state.inviteCodes.forEach((inviteCode: TTInviteCode) => {
      total += inviteCode.available
    })
    return total
  }),
  numberOfAvailableInviteCodes: computed(() => {
    let total = 0
    state.inviteCodes.forEach((inviteCode: TTInviteCode) => {
      total += inviteCode.available - inviteCode.uses.length
    })
    return total
  }),
  updateInviteCodes: async (): Promise<boolean> => {
    const inviteCodes = await state.atp.fetchInviteCodes()
    if (inviteCodes instanceof Error) return false
    state.inviteCodes.splice(0, state.inviteCodes.length, ...inviteCodes)
    return true
  },

  // プリファレンス
  currentPreferences: [],
  fetchPreferences: fetchPreferences,
  updatePreferences: updatePreferences,

  // ラベル
  hasLabel: hasLabel,
  getHarmfulLabels: getHarmfulLabels,
  getLabelerLabels: getLabelerLabels,
  getCustomLabels: getCustomLabels,

  // ラベラー
  myLabeler: undefined,
  currentLabeler: undefined,

  // チャット
  myChat: undefined,

  // 新着チャットタイマー
  chatListTimer: undefined,
  endChatListTimer: endChatListTimer,
  startChatListTimer: startChatListTimer,

  // ミュートユーザー
  currentMutingUsers: [],
  currentMutingUsersCursor: undefined,

  // ブロックユーザー
  currentBlockingUsers: [],
  currentBlockingUsersCursor: undefined,

  // プロフィール
  inSameProfilePage: false,
  profileFolding: false,
  userProfile: null,
  currentProfile: null,
  // -------------------------------- resetProfileState() 対象エリア
  currentAuthorFeeds: [],
  currentAuthorFeedsCursor: undefined,
  currentAuthorFeedsWithReplies: [],
  currentAuthorFeedsWithRepliesCursor: undefined,
  currentAuthorFeedsWithMedia: [],
  currentAuthorFeedsWithMediaCursor: undefined,
  currentAuthorFeedGenerators: [],
  currentAuthorFeedGeneratorsCursor: undefined,
  currentAuthorReposts: [],
  currentAuthorRepostsCursor: undefined,
  currentAuthorLikes: [],
  currentAuthorLikesCursor: undefined,
  currentAuthorLists: [],
  currentAuthorListsCursor: undefined,
  currentAuthorPostOfPinnedPost: undefined,
  currentAuthorStarterPacks: [],
  currentAuthorStarterPacksCursor: undefined,
  currentFollowers: [],
  currentFollowersCursor: undefined,
  currentFollowings: [],
  currentFollowingsCursor: undefined,
  currentSuggestedFollows: [],
  // -------------------------------- resetProfileState() 対象エリア

  resetProfileState: resetProfileState,
  isMyProfile: isMyProfile,
  fetchUserProfile: fetchUserProfile,
  updateUserProfile: updateUserProfile,
  fetchCurrentProfile: fetchCurrentProfile,
  fetchCurrentAuthorFeedGenerators: fetchCurrentAuthorFeedGenerators,
  fetchCurrentAuthorFeed: fetchCurrentAuthorFeed,
  fetchAuthorReposts: fetchAuthorReposts,
  fetchAuthorLikes: fetchAuthorLikes,
  fetchAuthorLists: fetchAuthorLists,
  fetchAuthorStarterPacks: fetchAuthorStarterPacks,
  fetchFollowers: fetchFollowers,
  fetchFollowings: fetchFollowings,
  fetchSuggestedFollows: fetchSuggestedFollows,
  fetchSuggestions: fetchSuggestions,

  // ポストスレッド
  currentPosts: [],
  fetchPostThread: fetchPostThread,

  // フォロー中フィード
  timelineFeeds: [],
  timelineCursor: undefined,
  fetchTimeline: fetchTimeline,

  // 検索

  // 検索 - 現在の検索キーワード
  currentSearchTerm: "",

  // 検索 - 現在のポスト検索フォーム
  currentSearchPostFormState: {
    sort: "latest",
    lang: [],
    author: [],
  },

  // 検索 - 現在のポスト検索結果
  currentSearchPostResults: [],
  currentSearchPostCursor: undefined,
  currentSearchPostsLastTerm: undefined,
  fetchSearchPosts: fetchSearchPosts,

  // 検索 - 現在のフィード検索結果
  currentSearchFeeds: [],
  currentSearchFeedsCursor: undefined,
  currentSearchFeedsLastTerm: undefined,
  fetchSearchFeeds: fetchSearchFeeds,

  // 検索 - 現在のおすすめユーザー検索結果
  currentSearchSuggestionResults: [],
  currentSearchSuggestionCursor: undefined,

  // 検索 - 現在のユーザー検索結果
  currentSearchUsers: [],
  currentSearchUsersCursor: undefined,
  currentSearchLastUserTerm: undefined,

  // 検索 - トレンドタグ
  currentTrendTags: [],

  // カスタムフィード
  currentCustomFeedsUri: undefined,
  currentCustomFeeds: [],
  currentCustomFeedsCursor: undefined,
  currentPopularFeedGenerators: [],
  currentPopularFeedGeneratorsCursor: undefined,
  currentFeedPreference: currentFeedPreference(),
  fetchCustomFeeds: fetchCustomFeeds,
  fetchPopularFeedGenerators: fetchPopularFeedGenerators,
  sortFeedPreferencesSavedAndPinned: sortFeedPreferencesSavedAndPinned,
  removeFeedPreferenceByUri: removeFeedPreferenceByUri,

  // マイフィード
  myFeeds: undefined,

  // リスト
  currentList: undefined,
  currentListItems: [],
  currentListItemsCursor: undefined,
  currentListFeeds: [],
  currentListFeedsCursor: undefined,
  fetchCurrentList: fetchCurrentList,
  fetchCurrentListItems: fetchCurrentListItems,
  fetchCurrentListFeeds: fetchCurrentListFeeds,

  // マイリスト
  myLists: undefined,

  // スターターパック
  currentStarterPack: undefined,
  currentStarterPackListFeeds: [],
  currentStarterPackListFeedsCursor: undefined,
  fetchCurrentStarterPackListFeeds: fetchCurrentStarterPackListFeeds,

  // グローバルフィード
  globallinePosts: [],
  globallineProfiles: {},
  globallineNumberOfPosts: 0,

  // ポップオーバー

  // ポップオーバー - 設定ポップオーバー
  settingsPopoverDisplay: false,
  settingsPopoverSelector: "",
  settingsPopoverDirection: "toRight",
  openSettingsPopover: openSettingsPopover,
  closeSettingsPopover: closeSettingsPopover,

  // ポップオーバー - プロフィールポップオーバー
  profilePopoverProps: {
    display: false,
    isUser: false,
    user: undefined,
  },
  profilePopoverSelector: undefined,
  profilePopoverFrom: undefined,
  openProfilePopover: openProfilePopover,
  closeProfilePopover: closeProfilePopover,

  // ポップオーバー - ポストポップオーバー
  postPopoverProps: {
    display: false,
    post: undefined,
  },
  postPopoverSelector: undefined,
  postPopoverCallback: undefined,
  openPostPopover: openPostPopover,
  closePostPopover: closePostPopover,

  // ポップオーバー - フィードカードポップオーバー
  feedCardPopoverProps: {
    display: false,
    generator: undefined,
  },
  feedCardPopoverSelector: undefined,
  openFeedCardPopover: openFeedCardPopover,
  closeFeedCardPopover: closeFeedCardPopover,

  // ポップオーバー - リストカードポップオーバー
  listCardPopoverProps: {
    display: false,
    list: undefined,
  },
  listCardPopoverSelector: undefined,
  listCardPopoverCallback: undefined,
  openListCardPopover: openListCardPopover,
  closeListCardPopover: closeListCardPopover,

  // ポップオーバー - スターターパックカードポップオーバー
  starterPackCardPopoverProps: {
    display: false,
    starterPack: undefined,
  },
  starterPackCardPopoverSelector: undefined,
  starterPackCardPopoverCallback: undefined,
  openStarterPackCardPopover: openStarterPackCardPopover,
  closeStarterPackCardPopover: closeStarterPackCardPopover,

  // ポップオーバー - マイフィードソートポップオーバー
  myFeedsSortPopoverProps: {
    display: false,
  },
  myFeedsSortPopoverSelector: undefined,
  myFeedsSortPopoverCallback: undefined,
  openMyFeedsSortPopover: openMyFeedsSortPopover,
  closeMyFeedsSortPopover: closeMyFeedsSortPopover,

  // ポップオーバー - チャットルームポップオーバー
  chatConvoPopoverProps: {
    display: false,
    myConvo: undefined,
  },
  chatConvoPopoverSelector: undefined,
  chatConvoPopoverCallback: undefined,
  openChatConvoPopover: openChatConvoPopover,
  closeChatConvoPopover: closeChatConvoPopover,

  // ポップオーバー - チャット公開設定ポップオーバー
  chatDeclarationSelectPopoverProps: {
    display: false,
  },
  chatDeclarationSelectPopoverSelector: undefined,
  chatDeclarationSelectPopoverCallback: undefined,
  openChatDeclarationSelectPopover: openChatDeclarationSelectPopover,
  closeChatDeclarationSelectPopover: closeChatDeclarationSelectPopover,

  // ポップオーバー - チャットメッセージポップオーバー
  chatMessagePopoverProps: {
    display: false,
    myConvo: undefined,
    message: undefined,
  },
  chatMessagePopoverSelector: undefined,
  chatMessagePopoverCallback: undefined,
  openChatMessagePopover: openChatMessagePopover,
  closeChatMessagePopover: closeChatMessagePopover,

  // ポップオーバー - キーワード履歴ポップオーバー
  keywordHistoryPopoverProps: {
    display: false,
    selector: undefined,
    keywords: [],
  },
  openKeywordHistoryPopover: openKeywordHistoryPopover,
  closeKeywordHistoryPopover: closeKeywordHistoryPopover,
  addKeywordHistory: addKeywordHistory,

  // ポップアップ

  // ポップアップ - エラーポップアップ
  errorPopupProps: {
    display: false,
    error: undefined,
    description: undefined,
  },
  openErrorPopup: openErrorPopup,
  closeErrorPopup: closeErrorPopup,

  // ポップアップ - メッセージポップアップ
  messagePopupProps: {
    display: false,
    title: undefined,
    text: undefined,
    hasTranslateLink: false,
  },
  openMessagePopup: openMessagePopup,
  closeMessagePopup: closeMessagePopup,

  // ポップアップ - 確認ポップアップ
  confirmationPopupProps: {
    display: false,
    title: undefined,
    text: undefined,
    detail: undefined,
    result: false,
  },
  openConfirmationPopup: openConfirmationPopup,
  closeConfirmationPopup: closeConfirmationPopup,
  applyConfirmationPopup: applyConfirmationPopup,

  // ポップアップ - ログインポップアップ
  loginPopupDisplay: false,
  loginPopupAutoDisplay: computed((): boolean => {
    return state.mounted && (!state.atp.hasLogin() || state.loginPopupDisplay)
  }),

  // ポップアップ - アカウントポップアップ
  accountPopupDisplay: false,
  openAccountPopup: openAccountPopup,
  closeAccountPopup: closeAccountPopup,

  // ポップアップ - 通知ポップアップ
  notificationPopupDisplay: false,
  openNotificationPopup: openNotificationPopup,
  closeNotificationPopup: closeNotificationPopup,

  // ポップアップ - UI言語設定ポップアップ
  uiLanguageSettingsPopupDisplay: false,
  openUiLanguageSettingsPopup: openUiLanguageSettingsPopup,
  closeUiLanguageSettingsPopup: closeUiLanguageSettingsPopup,

  // ポップアップ - デザイン設定ポップアップ
  designSettingsPopupDisplay: false,
  openDesignSettingsPopup: openDesignSettingsPopup,
  closeDesignSettingsPopup: closeDesignSettingsPopup,

  // ポップアップ - ポスト設定ポップアップ
  postSettingsPopupDisplay: false,
  openPostSettingsPopup: openPostSettingsPopup,
  closePostSettingsPopup: closePostSettingsPopup,

  // ポップアップ - 時間設定ポップアップ
  timeSettingsPopupDisplay: false,
  openTimeSettingsPopup: openTimeSettingsPopup,
  closeTimeSettingsPopup: closeTimeSettingsPopup,

  // ポップアップ - その他設定ポップアップ
  otherSettingsPopupDisplay: false,
  openOtherSettingsPopup: openOtherSettingsPopup,
  closeOtherSettingsPopup: closeOtherSettingsPopup,

  // ポップアップ - 招待コードポップアップ
  inviteCodesPopupDisplay: false,
  openInviteCodesPopup: openInviteCodesPopup,
  closeInviteCodesPopup: closeInviteCodesPopup,

  // ポップアップ - コンテンツ言語ポップアップ
  contentLanguagesPopupDisplay: false,
  openContentLanguagesPopup: openContentLanguagesPopup,
  closeContentLanguagesPopup: closeContentLanguagesPopup,

  // ポップアップ - ポスト言語ポップアップ
  postLanguagesPopupDisplay: false,
  openPostLanguagesPopup: openPostLanguagesPopup,
  closePostLanguagesPopup: closePostLanguagesPopup,

  // ポップアップ - ミュートユーザーリストポップアップ
  mutingUsersPopupDisplay: false,
  openMutingUsersPopup: openMutingUsersPopup,
  closeMutingUsersPopup: closeMutingUsersPopup,

  // ポップアップ - ブロックユーザーリストポップアップ
  blockingUsersPopupDisplay: false,
  openBlockingUsersPopup: openBlockingUsersPopup,
  closeBlockingUsersPopup: closeBlockingUsersPopup,

  // ポップアップ - ワードミュートポップアップ
  wordMutePopupDisplay: false,
  openWordMutePopup: openWordMutePopup,
  closeWordMutePopup: closeWordMutePopup,

  // ポップアップ - チャット一覧ポップアップ
  chatListPopupProps: {
    display: false,
  },
  openChatListPopup: openChatListPopup,
  closeChatListPopup: closeChatListPopup,

  // ポップアップ - チャットルームポップアップ
  chatConvoPopupProps: {
    display: false,
    myConvo: undefined,
  },
  openChatConvoPopup: openChatConvoPopup,
  closeChatConvoPopup: closeChatConvoPopup,

  // ポップアップ - チャットメンバー選択ポップアップ
  chatMembersSelectPopupProps: {
    display: false,
    users: [],
    limit: 1,
  },
  openChatMembersSelectPopup: openChatMembersSelectPopup,
  closeChatMembersSelectPopup: closeChatMembersSelectPopup,

  // ポップアップ - ラベラー一覧ポップアップ
  labelerListPopupProps: {
    display: false,
    title: "",
    labelers: [],
  },
  openLabelerListPopup: openLabelerListPopup,
  closeLabelerListPopup: closeLabelerListPopup,

  // ポップアップ - ラベラー設定ポップアップ
  labelerSettingsPopupProps: {
    display: false,
    labeler: undefined,
  },
  openLabelerSettingsPopup: openLabelerSettingsPopup,
  closeLabelerSettingsPopup: closeLabelerSettingsPopup,

  // ポップアップ - ラベル選択ポップアップ
  selectLabelsPopupDisplay: false,
  selectLabelsPopupState: undefined,
  openSelectLabelsPopup: openSelectLabelsPopup,
  closeSelectLabelsPopup: closeSelectLabelsPopup,

  // ポップアップ - アカウントレポート送信ポップアップ
  sendAccountReportPopupProps: {
    display: false,
    user: undefined,
  },
  openSendAccountReportPopup: openSendAccountReportPopup,
  closeSendAccountReportPopup: closeSendAccountReportPopup,

  // ポップアップ - ポストレポート送信ポップアップ
  sendPostReportPopupProps: {
    display: false,
    post: undefined,
  },
  openSendPostReportPopup: openSendPostReportPopup,
  closeSendPostReportPopup: closeSendPostReportPopup,

  // ポップアップ - フィードレポート送信ポップアップ
  sendFeedReportPopupProps: {
    display: false,
    generator: undefined,
  },
  openSendFeedReportPopup: openSendFeedReportPopup,
  closeSendFeedReportPopup: closeSendFeedReportPopup,

  // ポップアップ - リストレポート送信ポップアップ
  sendListReportPopupProps: {
    display: false,
    list: undefined,
  },
  openSendListReportPopup: openSendListReportPopup,
  closeSendListReportPopup: closeSendListReportPopup,

  // ポップアップ - イメージポップアップ
  imagePopupProps: {
    did: "",
    images: [],
    alts: [],
    index: 0,
    display: false,
  },

  // ポップアップ - リポストユーザーポップアップ
  currentRepostUsers: [],
  currentRepostUsersUri: undefined,
  currentRepostUsersCursor: undefined,
  repostUsersPopupDisplay: false,
  openRepostUsersPopup: openRepostUsersPopup,
  closeRepostUsersPopup: closeRepostUsersPopup,

  // ポップアップ - 引用リポスト一覧ポップアップ
  currentQuoteReposts: [],
  currentQuoteRepostsUri: undefined,
  currentQuoteRepostsCursor: undefined,
  quoteRepostsPopupDisplay: false,
  openQuoteRepostsPopup: openQuoteRepostsPopup,
  closeQuoteRepostsPopup: closeQuoteRepostsPopup,

  // ポップアップ - いいねユーザーポップアップ
  currentLikeUsers: [],
  currentLikeUsersUri: undefined,
  currentLikeUsersCursor: undefined,
  likeUsersPopupDisplay: false,
  openLikeUsersPopup: openLikeUsersPopup,
  closeLikeUsersPopup: closeLikeUsersPopup,

  // ポップアップ - マイフィードポップアップ
  myFeedsPopupDisplay: false,
  openMyFeedsPopup: openMyFeedsPopup,
  closeMyFeedsPopup: closeMyFeedsPopup,

  // ポップアップ - マイリストポップアップ
  myListPopupDisplay: false,
  openMyListPopup: openMyListPopup,
  closeMyListPopup: closeMyListPopup,

  // ポップアップ - リスト編集ポップアップ
  listEditPopupProps: {
    mode: undefined,
    display: false,
    list: undefined,
  },
  openListEditPopup: openListEditPopup,
  closeListEditPopup: closeListEditPopup,

  // ポップアップ - リストユーザー管理ポップアップ
  listUserManagementPopupProps: {
    display: false,
    user: undefined,
  },
  openListUserManagementPopup: openListUserManagementPopup,
  closeListUserManagementPopup: closeListUserManagementPopup,

  // ポップアップ - スターターパック編集ポップアップ
  starterPackEditPopupProps: {
    display: false,
    mode: undefined,
    starterPack: undefined,
  },
  openStarterPackEditPopup: openStarterPackEditPopup,
  closeStarterPackEditPopup: closeStarterPackEditPopup,

  // ポップアップ - タイムフィードポップアップ
  currentTimeFeeds: [],
  timeFeedsPopupDisplay: false,
  timeFeedsPopupProps: undefined,
  openTimeFeedsPopup: openTimeFeedsPopup,
  closeTimeFeedsPopup: closeTimeFeedsPopup,

  // ポップアップ - カスタムブックマークポップアップ
  currentCustomBookmarkPacks: [],
  currentCustomBookmarkPacksCursor: undefined,
  customBookmarkPopupDisplay: false,
  openCustomBookmarkPopup: openCustomBookmarkPopup,
  closeCustomBookmarkPopup: closeCustomBookmarkPopup,

  // ポップアップ - カスタムブックマーク管理ポップアップ
  customBookmarkManagementPopupProps: {
    display: false,
    post: undefined,
  },
  openCustomBookmarkManagementPopup: openCustomBookmarkManagementPopup,
  closeCustomBookmarkManagementPopup: closeCustomBookmarkManagementPopup,

  // ポップアップ - ポスト送信ポップアップ
  sendPostPopupProps: {
    display: false,
    type: "post",
    post: undefined,
    fileList: undefined,
    createdAt: undefined,
  },
  sendPostPopupProcessing: false,
  openSendPostPopup: openSendPostPopup,
  closeSendPostPopup: closeSendPostPopup,

  // ポップアップ - マイワードポップアップ
  myWordPopupProps: {
    display: false,
    mode: "select",
  },
  openMyWordPopup: openMyWordPopup,
  closeMyWordPopup: closeMyWordPopup,
  myWordPopupCallback: undefined,

  // ポップアップ - ポスト日時選択ポップアップ
  postDatePopupDisplay: false,
  postDatePopupDate: undefined,
  openPostDatePopup: openPostDatePopup,
  closePostDatePopup: closePostDatePopup,

  // ポップアップ - 反応制御ポップアップ
  reactionControlPopupProps: {
    display: false,
    isReply: false,
    postThreadgate: undefined,
    postUri: undefined,
  },
  openReactionControlPopup: openReactionControlPopup,
  closeReactionControlPopup: closeReactionControlPopup,

  // ポップアップ - リストメンションポップアップ
  listMentionPopupProps: {
    display: false,
    list: undefined,
    dids: [],
  },
  openListMentionPopup: openListMentionPopup,
  closeListMentionPopup: closeListMentionPopup,

    // ポップアップ - HTML ポップアップ
  htmlPopupProps: {
    display: false,
    type: undefined,
  },
  openHtmlPopup: openHtmlPopup,
  closeHtmlPopup: closeHtmlPopup,

  // ポップアップ - 進捗ポップアップ
  progressPopupDisplay: false,
  progressPopupProps: {
    value: 0,
    message: undefined,
  },
  openProgressPopup: openProgressPopup,
  closeProgressPopup: closeProgressPopup,
})

state.myWorker = new MyWorker(state)

state.myLabeler = new MyLabeler(state)

state.myChat = new MyChat(state)

state.myFeeds = new MyFeeds(state)

state.myLists = new MyLists(state)

// -------------------------------- resetProfileState() 対象エリア
resetProfileState()
// -------------------------------- resetProfileState() 対象エリア

// ---------------------------------------------------------------- 関数定義

function forceUpdate () {
  state.updateKey = new Date().getTime()
}

function formatDate (dateString?: string, absoluteNotation?: boolean): string {
  if (dateString == null) return ""
  const now = new Date()
  const the = new Date(dateString)

  // 今日
  if (endOfYesterday() < the && !absoluteNotation) {
    // 絶対表記
    if (state.currentSetting.timeControl === "absolute")
      return format(the, "HH:mm")
    // 相対表記
    else
      return intlFormatDistance(the, now, {
        numeric: "always",
        locale: state.currentSetting.uiLanguage,
      })
  }

  // 今年
  if (isSameYear(now, the)) return format(the, "MM/dd HH:mm")

  // 去年以前
  return format(the, "yyyy/MM/dd")
}

// 現在のサーバ情報

async function fetchCurrentServerInfo () {
  if (state.currentServerInfo != null) {
    return
  }
  const response = await state.atp.fetchServerInfo()
  if (response instanceof Error) {
    return
  }
  state.currentServerInfo = response

  //セッションキャッシュの設定
  state.myWorker!.setSessionCache("serverInfo", state.currentServerInfo)
}

// 設定

function resetSettings () {
  const did = state.atp.session?.did
  if (did == null) return
  Object.keys(state.settings[did]).forEach((key: string) => {
    delete state.settings[did][key]
  })
  Util.saveStorage("settings", state.settings)
}

function updateSettings () {
  updateCurrentLanguageSetting()
  updateFontSetting()
  updateColorThemeSetting()

  // 新着フォロー中フィードタイマーの更新
  updateTimelineInterval()

  // 新着通知タイマーの更新
  updateNotificationInterval()

  // 新着チャットタイマーの更新
  state.startChatListTimer()
}

function saveSettings () {
  const did = state.atp.session?.did
  if (did == null) {
    return
  }
  if (state.settings[did] == null) {
    state.settings[did] = {}
  }
  if (state.settings[did].uiLanguage == null) {
    state.settings[did].uiLanguage = state.$getCurrentLanguage != null
      ? state.$getCurrentLanguage()
      : window.navigator.language
  }
  if (state.settings[did].autoTranslation == null) {
    state.settings[did].autoTranslation = false
  }
  if (state.settings[did].autoTranslationIgnoreLanguage == null) {
    state.settings[did].autoTranslationIgnoreLanguage = undefined
  }
  if (state.settings[did].chatFetchInterval == null) {
    state.settings[did].chatFetchInterval = 30000
  }
  if (state.settings[did].contentLanguages == null) {
    state.settings[did].contentLanguages = []
  } else {
    state.settings[did].contentLanguages = getSanitizedLanguages(state.settings[did].contentLanguages)
  }
  if (state.settings[did].fontSize == null) {
    state.settings[did].fontSize = "medium"
  }
  if (state.settings[did].fontKerning == null) {
    state.settings[did].fontKerning = false
  }
  if (state.settings[did].fontAntialiasing == null) {
    state.settings[did].fontAntialiasing = true
  }
  if (state.settings[did].notificationFetchInterval == null) {
    state.settings[did].notificationFetchInterval = 30000
  }
  if (state.settings[did].timelineFetchInterval == null) {
    state.settings[did].timelineFetchInterval = 10000
  }
  if (state.settings[did].myWords == null) {
    state.settings[did].myWords = []
  }
  if (state.settings[did].wordMute == null) {
    state.settings[did].wordMute = []
  }
  if (state.settings[did].replyFolding == null) {
    state.settings[did].replyFolding = [4]
  }
  if (state.settings[did].repostFolding == null) {
    state.settings[did].repostFolding = [1, 2, 5]
  }
  if (state.settings[did].timeControl == null) {
    state.settings[did].timeControl = "relative"
  }
  if (state.settings[did].imageFolding == null) {
    state.settings[did].imageFolding = "none"
  }
  if (state.settings[did].imageMaxHeightRatio == null) {
    state.settings[did].imageMaxHeightRatio = 1.5
  }
  if (state.settings[did].imageAutoPlay == null) {
    state.settings[did].imageAutoPlay = true
  }
  if (state.settings[did].videoPreload == null) {
    state.settings[did].videoPreload = "metadata"
  }
  if (state.settings[did].linkcardLayout == null) {
    state.settings[did].linkcardLayout = "vertical"
  }
  if (state.settings[did].linkcardEmbeddedControl == null) {
    state.settings[did].linkcardEmbeddedControl = [
      "applemusic",
      "giphy",
      "graysky",
      "spotify",
      "tenor",
      "twitch",
      "youtube",
      "vimeo",
      "nicovideo",
    ]
  }
  if (state.settings[did].globallineContentLanguages == null) {
    state.settings[did].globallineContentLanguages = [Util.getUserLanguage() ?? "en"]
  }
  if (state.settings[did].globallineSkipPostHasNoLanguage == null) {
    state.settings[did].globallineSkipPostHasNoLanguage = true
  }
  if (state.settings[did].globallinePostTypes == null) {
    state.settings[did].globallinePostTypes = ["post"]
  }
  if (state.settings[did].globallineFollowersCountThreshold == null) {
    state.settings[did].globallineFollowersCountThreshold = undefined
  }
  if (state.settings[did].globallineLayout == null) {
    state.settings[did].globallineLayout = "post"
  }
  if (state.settings[did].colorTheme == null) {
    state.settings[did].colorTheme = "auto"
  }
  if (state.settings[did].feedSearchKeywordHistory == null) {
    state.settings[did].feedSearchKeywordHistory = []
  }
  if (state.settings[did].mainAreaOpacity == null) {
    state.settings[did].mainAreaOpacity = 1.0
  }
  if (state.settings[did].backgroundImage == null) {
    state.settings[did].backgroundImage = undefined
  }
  if (state.settings[did].backgroundOpacity == null) {
    state.settings[did].backgroundOpacity = 0.5
  }
  if (state.settings[did].hideNotificationBadge == null) {
    state.settings[did].hideNotificationBadge = false
  }
  if (state.settings[did].hideNumberOfReaction == null) {
    state.settings[did].hideNumberOfReaction = false
  }
  if (state.settings[did].postAnonymization == null) {
    state.settings[did].postAnonymization = false
  }
  if (state.settings[did].postLanguages == null) {
    state.settings[did].postLanguages = [Util.getUserLanguage() ?? "en"]
  } else {
    state.settings[did].postLanguages = getSanitizedLanguages(state.settings[did].postLanguages)
  }
  if (state.settings[did].postSearchKeywordHistory == null) {
    state.settings[did].postSearchKeywordHistory = []
  }
  if (state.settings[did].lightning == null) {
    state.settings[did].lightning = undefined
  }
  if (state.settings[did].userSearchKeywordHistory == null) {
    state.settings[did].userSearchKeywordHistory = []
  }
  state.currentSetting = state.settings[did]
  Util.saveStorage("settings", state.settings)

  //セッションキャッシュの設定
  state.myWorker!.setSessionCache("setting", state.settings[did])
}

function getSanitizedLanguages (languages?: Array<string>) {
  return languages?.filter((language: string) => {
    return LANGUAGES.findIndex((target: any) => language === target.value) !== - 1
  })
}

function updateCurrentLanguageSetting () {
  if (state.currentSetting?.uiLanguage == null) return

  // NOTICE: UI言語の変更を即時反映するために `forceUpdate()` を呼び出すと、
  //         すべてのコンポーネントが更新されてしまう。この現象の防止策として、
  //         UI言語の変更以外では `forceUpdate()` を呼び出さないようにしている
  const oldUiLanguage = state.$getCurrentLanguage != null ? state.$getCurrentLanguage() : undefined
  if (state.$setCurrentLanguage != null) state.$setCurrentLanguage(state.currentSetting.uiLanguage)
  if (oldUiLanguage !== state.currentSetting.uiLanguage) state.forceUpdate()
}

function updateFontSetting () {
  updateFontSizeSetting()
  updateFontKerningSetting()
  updateFontAntialiasingSetting()
}

function updateFontSizeSetting () {
  window.document.documentElement.setAttribute(
    "data-font-size",
    state.currentSetting?.fontSize ?? "medium"
  )
}

function updateFontKerningSetting () {
  window.document.documentElement.setAttribute(
    "data-font-kerning",
    (!!state.currentSetting?.fontKerning).toString()
  )
}

function updateFontAntialiasingSetting () {
  window.document.documentElement.setAttribute(
    "data-font-antialiasing",
    (!!state.currentSetting?.fontAntialiasing).toString()
  )
}

function updateColorThemeSetting () {
  if (state.currentSetting?.colorTheme != null) {
    window.document.documentElement.setAttribute(
      "data-color-theme",
      state.currentSetting.colorTheme as string
    )
  }
}

// 通知

async function fetchNotifications (limit: number, direction: "new" | "old") {
  const result = await state.atp.fetchNotifications(
    state.notifications,
    limit,
    direction === "new" ? undefined : state.notificationCursor
  )

  // 最後に通知を取得した日時を保存（ updateSeenNotifications で使用）
  state.lastFetchNotificationsDate = new Date()

  if (result instanceof Error) {
    state.openErrorPopup(result, "mainState/fetchNotifications")
    return
  }
  if (result.cursor == null) {
    return
  }
  if (state.notificationCursor == null) {
    state.notificationCursor = result.cursor
    return
  }
  const oldDate = new Date(state.notificationCursor)
  const newDate = new Date(result.cursor)
  if (Number.isNaN(oldDate.getTime()) ||
      Number.isNaN(newDate.getTime()) ||
      oldDate > newDate
  ) {
    state.notificationCursor = result.cursor
  }
}

// 新着通知タイマー

function clearNotificationInterval () {
  if (state.notificationTimer != null) {
    clearInterval(state.notificationTimer)
    state.notificationTimer = null
  }
}

function updateNotificationInterval () {
  state.clearNotificationInterval()
  if (state.currentSetting.notificationFetchInterval === 0) {
    return
  }
  state.notificationTimer = setInterval(
    state.updateNotifications,
    state.currentSetting.notificationFetchInterval ?? CONSTS.DEFAULT_NOTIFICATION_FETCH_INTERVAL
  )
}

async function updateNotifications () {
  const response = await state.atp.fetchNotificationCount()
  const count = response instanceof Error ? 0 : response
  const canFetched = state.notificationCount < count
  if (count > 0) {
    state.notificationCount = count
    state.updatePageTitle()
  }
  if (canFetched) {
    // NOTICE: 念のため + 1 している
    await state.fetchNotifications(Math.min(CONSTS.LIMIT_OF_FETCH_NOTIFICATIONS, count + 1), "new")
  }
}

// 新着フォロー中フィードタイマー

function clearTimelineInterval () {
  if (state.timelineTimer != null) {
    clearInterval(state.timelineTimer)
    state.timelineTimer = null
  }
}

function updateTimelineInterval () {
  state.clearTimelineInterval()
  if (state.currentSetting.timelineFetchInterval === 0) {
    return
  }
  state.timelineTimer = setInterval(
    state.updateTimeline,
    state.currentSetting.timelineFetchInterval ?? CONSTS.DEFAULT_TIMELINE_FETCH_INTERVAL
  )
}

async function updateTimeline () {
  const response = await state.atp.fetchTimelineNewArrival()
  if (response instanceof Error) {
    return
  }

  // 稀に空配列が返るため
  if (response.length === 0) {
    state.hasTimelineNewArrival = false
    return
  }

  const latestPostUri = response[0].post?.uri
  if (latestPostUri == null) {
    state.hasTimelineNewArrival = false
    return
  }
  state.hasTimelineNewArrival = state.timelineFeeds.every((feed) => {
    return feed.post?.uri !== latestPostUri
  })
}

// プリファレンス

async function fetchPreferences (): Promise<boolean> {
  const preferences = await state.atp.fetchPreferences()
  if (preferences instanceof Error) {
    state.openErrorPopup(preferences, "mainState/fetchPreferences")
    return false
  }
  state.currentPreferences.splice(0, state.currentPreferences.length, ...preferences)
  return true
}

async function updatePreferences (): Promise<boolean> {
  // V1 形式の内部データを V2 に変換して上書き
  state.myFeeds?.convertV1ToV2()

  const result = await state.atp.updatePreferences(state.currentPreferences)
  if (result instanceof Error) {
    state.openErrorPopup(result, "mainState/updatePreferences")
    return false
  }
  return true
}

// ラベル

function hasLabel (target: string, labels?: Array<TTLabel>): boolean {
  return (labels?.findIndex((label: TTLabel) => {
    return label.val === target
  }) ?? - 1) !== - 1
}

function getHarmfulLabels (labels?: Array<TTLabel>): Array<TTLabel> {
  return labels?.filter((label: TTLabel) => {
    return label.src === CONSTS.OFFICIAL_LABELER_DID // LABEL_BEHAVIORS[label.val] != null
  }) ?? []
}

function getLabelerLabels (labels?: Array<TTLabel>): Array<TTLabel> {
  return labels?.filter((label: TTLabel) => {
    return label.src !== CONSTS.OFFICIAL_LABELER_DID &&
           (label.ver ?? 0) >= 1
  }) ?? []
}

function getCustomLabels (labels?: Array<TTLabel>): Array<TTLabel> {
  return labels?.filter((label: TTLabel) => {
    if (label.val === "!no-unauthenticated") {
      return false
    }
    return label.src !== CONSTS.OFFICIAL_LABELER_DID &&
           !label.ver
  }) ?? []
}

// 新着チャットタイマー

function endChatListTimer () {
  if (state.chatListTimer != null) {
    clearInterval(state.chatListTimer)
    state.chatListTimer = undefined
  }
}

async function startChatListTimer () {
  state.endChatListTimer()
  if (state.myChat!.disabled) {
    return
  }
  if (!state.currentSetting?.chatFetchInterval) {
    return
  }

  // 通常は convo を1件のみ取得し、 cursor に差異があれば全件取得する
  let prevCursor: undefined | string = "UNUSED_CURSOR"
  state.chatListTimer = setInterval(async () => {
    if (!state.currentSetting?.chatFetchInterval) {
      return
    }
    const currentCursor = await state.myChat!.updateConvos(1)
    if (prevCursor !== "UNUSED_CURSOR" &&
        prevCursor !== currentCursor
    ) {
      await state.myChat!.updateConvosAll()
    }
    prevCursor = currentCursor
    state.updatePageTitle()
  }, state.currentSetting?.chatFetchInterval ?? 60000)
}

// プロフィール

function resetProfileState () {
  resetArray(state, "currentAuthorFeeds")
  state.currentAuthorFeedsCursor = undefined
  resetArray(state, "currentAuthorFeedsWithReplies")
  state.currentAuthorFeedsWithRepliesCursor = undefined
  resetArray(state, "currentAuthorFeedsWithMedia")
  state.currentAuthorFeedsWithMediaCursor = undefined
  resetArray(state, "currentAuthorFeedGenerators")
  state.currentAuthorFeedGeneratorsCursor = undefined
  resetArray(state, "currentAuthorReposts")
  state.currentAuthorRepostsCursor = undefined
  resetArray(state, "currentAuthorLikes")
  state.currentAuthorLikesCursor = undefined
  resetArray(state, "currentAuthorLists")
  state.currentAuthorListsCursor = undefined
  resetArray(state, "currentAuthorStarterPacks")
  state.currentAuthorStarterPacksCursor = undefined
  resetArray(state, "currentFollowers")
  state.currentFollowersCursor = undefined
  resetArray(state, "currentFollowings")
  state.currentFollowingsCursor = undefined
  resetArray(state, "currentSuggestedFollows")
  state.currentAuthorPostOfPinnedPost = undefined
}

function resetArray (state: any, key: string) {
  state[key] == null
    ? state[key] = []
    : state[key].splice(0)
}

function isMyProfile (): boolean {
  const account = state.currentQuery.account as LocationQueryValue
  return account === state.atp.session?.handle ||
         account === state.atp.session?.did
}

async function fetchUserProfile () {
  const userProfile = await state.atp.fetchProfile(state.atp.session?.did as string)
  if (userProfile instanceof Error) {
    state.userProfile = null
    return
  }
  state.userProfile = userProfile

  // 現在のセッションにアバター画像を設定
  if (state.atp.session != null && state.userProfile?.avatar != null) {
    state.atp.session.__avatar = state.userProfile?.avatar
  }
}

async function updateUserProfile (profile: TTUpdateProfileParams) {
  state.loaderDisplay = true
  const response = await state.atp.updateProfile(profile)
  state.loaderDisplay = false
  if (response instanceof Error) {
    state.openErrorPopup(response, "mainState/updateUserProfile")
  }
}

async function fetchCurrentProfile (did: string): Promise<Error | undefined> {
  // 各種プロフィール関連データの初期化
  state.currentProfile = null
  state.currentAuthorReposts.splice(0)
  state.currentAuthorLikes.splice(0)
  state.currentAuthorLists.splice(0)
  state.currentAuthorFeedGenerators.splice(0)
  state.currentFollowers.splice(0)
  state.currentFollowings.splice(0)
  state.currentSuggestedFollows.splice(0)
  state.currentAuthorPostOfPinnedPost = undefined

  // プロフィールデータの取得
  const currentProfile = await state.atp.fetchProfile(did)
  if (currentProfile instanceof Error) {
    state.currentProfile = null
    return currentProfile
  }
  state.currentProfile = currentProfile

  // 現在のプロフィールがユーザープロフィールの場合
  if (did === state.atp.session?.did) {
    state.userProfile = state.currentProfile

    // セッションキャッシュの設定
    state.myWorker!.setSessionCache("userProfile", state.userProfile)
  }

  // 固定ポストのインポート
  fetchPinnedPost(state.currentProfile)

  // ハンドル履歴の取得
  updateCurrentLog()
    .then(() => {
      // describeRepo の取得
      updateCurrentRepo()
    })
}

async function fetchPinnedPost (profile?: TTProfile) {
  if (profile?.pinnedPost?.uri != null) {
    const posts = await state.atp.fetchPosts([profile.pinnedPost.uri])
    if (posts instanceof Error) {
      // TODO:
      // state.openErrorPopup(posts, "mainState/fetchPinnedPost")
      return
    }
    if (posts[0] != null) {
      state.currentAuthorPostOfPinnedPost = posts[0]
    }
  } else {
    state.currentAuthorPostOfPinnedPost = undefined
  }
}

async function updateCurrentLog () {
  if (state.currentProfile == null) {
    return
  }
  const logJson = await state.atp.fetchLogAudit(state.currentProfile.did)
  if (logJson instanceof Error || logJson == null) {
    return
  }
  if (state.currentProfile == null) {
    return // await 中に初期化される恐れがあるため
  }
  state.currentProfile.__log = logJson
}

async function updateCurrentRepo () {
  if (state.currentProfile == null) {
    return
  }
  const response = await state.atp.fetchWithoutAgent(
    "com.atproto.repo.describeRepo",
    state.currentProfile.did,
    { repo: state.currentProfile.did }
  )
    .then((value) => value)
    .catch((error) => error)
  if (response == null) {
    // state.openErrorPopup("apiError", "mainState/updateCurrentRepo")
    return
  }
  if (response instanceof Error) {
    // state.openErrorPopup(response, "mainState/updateCurrentRepo")
    return
  }
  const json = await response.json()
  if (state.currentProfile == null) {
    return // await 中に初期化される恐れがあるため
  }
  state.currentProfile.__repo = json
}

async function fetchCurrentAuthorFeedGenerators (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor = await state.atp.fetchAuthorFeedGenerators(
    state.currentAuthorFeedGenerators as Array<TTFeedGenerator>,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_CUSTOM_FEEDS,
    direction === "old" ? state.currentAuthorFeedGeneratorsCursor : undefined
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchCurrentAuthorFeedGenerators")
    return
  }
  if (cursor != null) {
    state.currentAuthorFeedGeneratorsCursor = cursor
  }
}

async function fetchCurrentAuthorFeed (direction: TTDirection, filter?: string, middleCursor?: string) {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const feeds = filter === "posts_with_replies"
    ? state.currentAuthorFeedsWithReplies
    : filter === "posts_with_media"
      ? state.currentAuthorFeedsWithMedia
      : state.currentAuthorFeeds

  const cursor = filter === "posts_with_replies"
    ? state.currentAuthorFeedsWithRepliesCursor
    : filter === "posts_with_media" 
      ? state.currentAuthorFeedsWithMediaCursor
      : state.currentAuthorFeedsCursor

  const resultCursor = await state.atp.fetchAuthorFeed(
    feeds as Array<TTFeed>,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_FEEDS,
    direction === "old" ? cursor : middleCursor,
    filter ?? "posts_no_replies",
    direction
  )
  if (resultCursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(resultCursor, "mainState/fetchCurrentAuthorFeed")
    return
  }
  if (resultCursor != null) {
    filter === "posts_with_replies"
      ? state.currentAuthorFeedsWithRepliesCursor = resultCursor
      : filter === "posts_with_media" 
        ? state.currentAuthorFeedsWithMediaCursor = resultCursor
        : state.currentAuthorFeedsCursor = resultCursor
  }
}

async function fetchAuthorReposts (direction: TTDirection) {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) {
    return
  }
  const cursor = await state.atp.fetchAuthorReposts(
    state.currentAuthorReposts,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_REPOSTS,
    direction === "new" ? undefined : state.currentAuthorRepostsCursor
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchAuthorReposts")
    return
  }
  state.currentAuthorRepostsCursor = cursor
}

async function fetchAuthorLikes (direction: TTDirection) {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return
  const cursor = await state.atp.fetchAuthorLikes(
    state.currentAuthorLikes,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_LIKES,
    direction === "new" ? undefined : state.currentAuthorLikesCursor
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchAuthorLikes")
    return
  }
  state.currentAuthorLikesCursor = cursor
}

async function fetchAuthorLists (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor = await state.atp.fetchActorLists(
    state.currentAuthorLists,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_LIST,
    direction === "new" ? undefined : state.currentAuthorListsCursor
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchAuthorLists")
    return
  }
  state.currentAuthorListsCursor = cursor
}

async function fetchAuthorStarterPacks (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor = await state.atp.fetchActorStarterPacks(
    state.currentAuthorStarterPacks,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_STARTER_PACKS,
    direction === "new" ? undefined : state.currentAuthorStarterPacksCursor
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchAuthorStarterPacks")
    return
  }
  state.currentAuthorStarterPacksCursor = cursor
}

async function fetchFollowers (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) {
    return
  }

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) {
    return
  }

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) {
    return
  }

  const cursor = await state.atp.fetchFollowers(
    state.currentFollowers,
    account,
    CONSTS.LIMIT_OF_FETCH_FOLLOWS,
    direction === "new" ? undefined : state.currentFollowersCursor
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchFollowers")
    return
  }
  state.currentFollowersCursor = cursor
}

async function fetchFollowings (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) {
    return
  }

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) {
    return
  }

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) {
    return
  }

  const cursor = await state.atp.fetchFollowings(
    state.currentFollowings,
    account,
    CONSTS.LIMIT_OF_FETCH_FOLLOWS,
    direction === "new" ? undefined : state.currentFollowingsCursor
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchFollowings")
    return
  }
  state.currentFollowingsCursor = cursor
}

async function fetchSuggestedFollows () {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) {
    return
  }
  const response = await state.atp.fetchSuggestedFollows(
    state.currentSuggestedFollows,
    account
  )
  if (response instanceof Error) {
    // TODO:
    // state.openErrorPopup(response, "mainState/fetchSuggestedFollows")
  }
}

async function fetchSuggestions (direction: "new" | "old") {
  const cursor = await state.atp.fetchSuggestions(
    state.currentSearchSuggestionResults,
    CONSTS.LIMIT_OF_FETCH_SUGGESTION_SEARCH,
    direction === "new" ? undefined : state.currentSearchSuggestionCursor
  )
  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup(cursor, "mainState/fetchSuggestions")
    return
  }
  state.currentSearchSuggestionCursor = cursor
}

// ポストスレッド

async function fetchPostThread () {
  let uri = state.currentQuery.uri as LocationQueryValue
  if (!uri) {
    // uri パラメータがない場合は handle と rkey パラメータがあるものとみなす
    let identifier = state.currentQuery.handle as LocationQueryValue as null | string
    const rkey = state.currentQuery.rkey as LocationQueryValue
    if (!identifier || !rkey) {
      return
    }

    // 渡されたのがDIDではない場合
    if (!identifier.startsWith("did:")) {
      const did = await state.atp.fetchDid(identifier)
      if (did instanceof Error) {
        return
      }
      identifier = did
    }

    uri = `at://${identifier}/app.bsky.feed.post/${rkey}`
  }
  state.currentPosts?.splice(0)
  const posts = await state.atp.fetchPostThread(uri, CONSTS.LIMIT_OF_FETCH_POST_THREAD) ?? []
  if (posts instanceof Error) {
    // TODO:
    // state.openErrorPopup(posts, "mainState/fetchPostThread")
    return
  }
  state.currentPosts = posts
}

// フォロー中フィード

async function fetchTimeline (direction: TTDirection, middleCursor?: string) {
  const cursor = await state.atp.fetchTimeline(
    state.timelineFeeds,
    state.currentSetting.replyFolding,
    state.currentSetting.repostFolding,
    CONSTS.LIMIT_OF_FETCH_TIMELINE,
    direction === "old" ? state.timelineCursor : middleCursor,
    direction
  )

  // 新着フォロー中フィードフラグをリセット
  if (direction === "new" && middleCursor == null) {
    state.hasTimelineNewArrival = false
  }

  if (cursor instanceof Error) {
    // TODO:
    // state.openErrorPopup("errorApiFailed", "mainState/fetchTimeline")
    return
  }
  if (cursor != null) {
    state.timelineCursor = cursor
  }
}

// 検索

// 検索 - 現在のポスト検索結果
async function fetchSearchPosts (cursor?: string) {
  // ポスト検索フォームの設定
  const params: { [k: string]: any } = {}
  params.sort = state.currentSearchPostFormState.sort
  if (state.currentSearchPostFormState.lang?.[0] != null) {
    params.lang = state.currentSearchPostFormState.lang[0]
  }
  if (state.currentSearchPostFormState.author?.[0] != null) {
    params.author = state.currentSearchPostFormState.author[0]
  }

  const newCursor = await state.atp.fetchPostSearch(
    state.currentSearchPostResults,
    state.currentSearchTerm,
    params,
    CONSTS.LIMIT_OF_FETCH_POST_SEARCH,
    cursor
  )
  if (newCursor instanceof Error) {
    state.openErrorPopup(newCursor, "mainState/fetchSearchPosts")
    return
  }
  if (newCursor == null) return
  state.currentSearchPostCursor = newCursor
}

// 検索 - 現在のフィード検索結果
async function fetchSearchFeeds (direction: "old" | "new") {
  const cursor = await state.atp.fetchPopularFeedGenerators(
    state.currentSearchFeeds,
    CONSTS.LIMIT_OF_FETCH_POPULAR_FEED_GENERATORS,
    direction === "old" ? state.currentSearchFeedsCursor : undefined,
    state.currentSearchTerm
  )
  if (cursor instanceof Error) {
    state.openErrorPopup(cursor, "mainState/fetchSearchFeeds")
    return
  }
  if (cursor != null) {
    state.currentSearchFeedsCursor = cursor
  }
}

// カスタムフィード

function currentFeedPreference () {
  return computed((): undefined | TTPreferenceCustomFeedV1 => {
    // V2 を V1 形式に変換している
    const preferences = state.currentPreferences.find((preference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPrefV2"
    }) as undefined | TTPreferenceCustomFeedV2
    if (preferences == null) {
      return
    }
    return {
      $type: "app.bsky.actor.defs#savedFeedsPref",
      pinned: (preferences.items
        ?.filter((preference) => {
          return !!preference.pinned
        })
        .map((preference) => {
          // URI に "following" 等が入る点に注意
          return preference.value
        }) ?? []) as Array<string>,
      saved: (preferences.items
        ?.map((preference) => {
          // URI に "following" 等が入る点に注意
          return preference.value
        }) ?? []) as Array<string>,
    }
  })
}

async function fetchCustomFeeds (direction: TTDirection, middleCursor?: string) {
  if (state.currentCustomFeedsUri !== state.currentQuery.feed) {
    state.currentCustomFeeds.splice(0)
    state.currentCustomFeedsCursor = undefined
  }
  const cursor = await state.atp.fetchCustomFeeds(
    state.currentCustomFeeds,
    state.currentQuery.feed,
    state.currentSetting.replyFolding,
    state.currentSetting.repostFolding,
    CONSTS.LIMIT_OF_FETCH_FEEDS,
    direction === "old" ? state.currentCustomFeedsCursor : middleCursor,
    direction,
    (feedUri: any): boolean => feedUri === state.currentQuery.feed,
  )
  if (cursor instanceof Error) {
    state.openErrorPopup(cursor, "mainState/fetchCustomFeeds")
    return
  }
  if (cursor != null) {
    state.currentCustomFeedsCursor = cursor
  }
  state.currentCustomFeedsUri = state.currentQuery.feed
}

async function fetchPopularFeedGenerators (direction: "old" | "new") {
  const cursor = await state.atp.fetchPopularFeedGenerators(
    state.currentPopularFeedGenerators,
    CONSTS.LIMIT_OF_FETCH_POPULAR_FEED_GENERATORS,
    direction === "old" ? state.currentPopularFeedGeneratorsCursor : undefined
  )
  if (cursor instanceof Error) {
    state.openErrorPopup(cursor, "mainState/fetchPopularFeedGenerators")
    return
  }
  if (cursor != null) {
    state.currentPopularFeedGeneratorsCursor = cursor
  }
}

function sortFeedPreferencesSavedAndPinned () {
  if (state.currentFeedPreference?.saved != null) {
    state.currentFeedPreference.saved = state.myFeeds!.savedUris
  }
  if (state.currentFeedPreference?.pinned != null) {
    state.currentFeedPreference.pinned = state.myFeeds!.pinnedUris
  }
}

function removeFeedPreferenceByUri (type: TTPreferenceFeedType, uri: string): boolean {
  const index = state.currentFeedPreference[type]
    .findIndex((currentUri: string) => {
      return currentUri === uri
    })
  if (index === - 1) {
    return false
  }
  state.currentFeedPreference[type].splice(index, 1)
  return true
}

// リスト

async function fetchCurrentList (listUri: string): Promise<boolean> {
  const response = await state.atp.fetchList(listUri)
  if (response instanceof Error) {
    state.openErrorPopup(response, "mainState/fetchList")
    return false
  }
  state.currentList = response
  return true
}

async function fetchCurrentListItems (direction: "old" | "new"): Promise<boolean> {
  if (state.currentList == null) return false
  const cursor = await state.atp.fetchListItems(
    state.currentListItems,
    state.currentList.uri,
    CONSTS.LIMIT_OF_FETCH_LIST_ITEMS,
    direction === "old" ? state.currentListItemsCursor : undefined
  )
  if (cursor instanceof Error) {
    state.openErrorPopup(cursor, "mainState/fetchListItems")
    return false
  }
  if (cursor != null) {
    state.currentListItemsCursor = cursor
  }
  return true
}

async function fetchCurrentListFeeds (direction: TTDirection, middleCursor?: string): Promise<boolean> {
  if (state.currentList == null) return false
  const cursor = await state.atp.fetchListFeeds(
    state.currentListFeeds,
    state.currentList.uri,
    state.currentSetting.replyFolding,
    state.currentSetting.repostFolding,
    CONSTS.LIMIT_OF_FETCH_LIST_FEEDS,
    direction === "old" ? state.currentListFeedsCursor : middleCursor,
    direction,
    (listUri: any): boolean => listUri === state.currentList?.uri,
  )
  if (cursor instanceof Error) {
    state.openErrorPopup(cursor, "mainState/fetchListFeeds")
    return false
  }
  if (cursor != null) {
    state.currentListFeedsCursor = cursor
  }
  return true
}

// スターターパック

async function fetchCurrentStarterPackListFeeds (
  direction: TTDirection,
  middleCursor?: string
): Promise<boolean> {
  if (state.currentStarterPack?.list == null) {
    return false
  }
  const cursor = await state.atp.fetchListFeeds(
    state.currentStarterPackListFeeds,
    state.currentStarterPack.list.uri,
    state.currentSetting.replyFolding,
    state.currentSetting.repostFolding,
    CONSTS.LIMIT_OF_FETCH_LIST_FEEDS,
    direction === "old" ? state.currentStarterPackListFeedsCursor : middleCursor,
    direction,
    (listUri: any): boolean => listUri === state.currentStarterPack?.list?.uri,
  )
  if (cursor instanceof Error) {
    state.openErrorPopup(cursor, "mainState/fetchCurrentStarterPackListFeeds")
    return false
  }
  if (cursor != null) {
    state.currentStarterPackListFeedsCursor = cursor
  }
  return true
}

// ポップオーバー

// ポップオーバー - 設定ポップオーバー

function openSettingsPopover (selector: string, direction: "toRight" | "toUp") {
  state.settingsPopoverSelector = selector
  state.settingsPopoverDirection = direction
  state.settingsPopoverDisplay = true
}

function closeSettingsPopover () {
  state.settingsPopoverDisplay = false
}

// ポップオーバー - プロフィールポップオーバー

function openProfilePopover (selector: string | HTMLElement) {
  state.profilePopoverSelector = selector
  state.profilePopoverProps.display = true
}

function closeProfilePopover () {
  state.profilePopoverProps.display = false
}

// ポップオーバー - ポストポップオーバー

function openPostPopover (selector: string | HTMLElement) {
  state.postPopoverSelector = selector
  state.postPopoverProps.display = true
}

function closePostPopover () {
  state.postPopoverProps.display = false
}

// ポップオーバー - フィードカードポップオーバー

function openFeedCardPopover (selector: string | HTMLElement) {
  state.feedCardPopoverSelector = selector
  state.feedCardPopoverProps.display = true
}

function closeFeedCardPopover () {
  state.feedCardPopoverProps.display = false
}

// ポップオーバー - リストカードポップオーバー

function openListCardPopover (selector: string | HTMLElement) {
  state.listCardPopoverSelector = selector
  state.listCardPopoverProps.display = true
}

function closeListCardPopover () {
  state.listCardPopoverProps.display = false
}

// ポップオーバー - スターターパックカードポップオーバー

function openStarterPackCardPopover (selector: string | HTMLElement) {
  state.starterPackCardPopoverSelector = selector
  state.starterPackCardPopoverProps.display = true
}

function closeStarterPackCardPopover () {
  state.starterPackCardPopoverProps.display = false
}

// ポップオーバー - マイフィードソートポップオーバー

function openMyFeedsSortPopover (selector: string | HTMLElement) {
  state.myFeedsSortPopoverSelector = selector
  state.myFeedsSortPopoverProps.display = true
}

function closeMyFeedsSortPopover () {
  state.myFeedsSortPopoverProps.display = false
}

// ポップオーバー - チャットルームポップオーバー

function openChatConvoPopover (selector: string | HTMLElement) {
  state.chatConvoPopoverSelector = selector
  state.chatConvoPopoverProps.display = true
}

function closeChatConvoPopover () {
  state.chatConvoPopoverProps.display = false
}

// ポップオーバー - チャット公開設置ポップオーバー

function openChatDeclarationSelectPopover (selector: string | HTMLElement) {
  state.chatDeclarationSelectPopoverSelector = selector
  state.chatDeclarationSelectPopoverProps.display = true
}

function closeChatDeclarationSelectPopover () {
  state.chatDeclarationSelectPopoverProps.display = false
}

// ポップオーバー - チャットメッセージポップオーバー

function openChatMessagePopover (selector: string | HTMLElement) {
  state.chatMessagePopoverSelector = selector
  state.chatMessagePopoverProps.display = true
}

function closeChatMessagePopover () {
  state.chatMessagePopoverProps.display = false
}

// ポップオーバー - キーワード履歴ポップオーバー

function openKeywordHistoryPopover (
  selector: string | HTMLElement,
  keywords: string[],
  callback?: Function
) {
  state.keywordHistoryPopoverProps.selector = selector
  state.keywordHistoryPopoverProps.keywords = keywords
  state.keywordHistoryPopoverProps.callback = callback
  state.keywordHistoryPopoverProps.display = true
}

function closeKeywordHistoryPopover () {
  state.keywordHistoryPopoverProps.display = false
}

function addKeywordHistory (newword: string, keywords?: string[]) {
  if (newword === "" || keywords == null) return
  const index = keywords.findIndex((keyword: string) => keyword === newword)
  if (index !== - 1) {
    keywords.splice(index, 1)
  }
  keywords.unshift(newword)
  keywords.splice(CONSTS.LIMIT_OF_KEYWORD_HISTORY)
}

// ポップアップ

// ポップアップ - エラーポップアップ

function openErrorPopup (error: any, description: any) {
  state.errorPopupProps.error = error
  state.errorPopupProps.description = description
  state.errorPopupProps.display = true
}

function closeErrorPopup () {
  state.errorPopupProps.display = false
}

// ポップアップ - メッセージポップアップ

function openMessagePopup ({ title, text, hasTranslateLink }: Omit<TTMessagePopupProps, "display">) {
  state.messagePopupProps.title = title
  state.messagePopupProps.text = text
  state.messagePopupProps.hasTranslateLink = hasTranslateLink
  state.messagePopupProps.display = true
}

function closeMessagePopup () {
  state.messagePopupProps.display = false
}

// ポップアップ - 確認ポップアップ

async function openConfirmationPopup (params: Omit<TIConfirmationPopupProps, "display" | "result">): Promise<boolean> {
  state.confirmationPopupProps.title = params.title
  state.confirmationPopupProps.text = params.text
  state.confirmationPopupProps.detail = params.detail
  state.confirmationPopupProps.post = params.post
  state.confirmationPopupProps.result = false
  state.confirmationPopupProps.display = true
  await Util.waitProp(() => state.confirmationPopupProps.display, false)
  return state.confirmationPopupProps.result
}

function closeConfirmationPopup () {
  state.confirmationPopupProps.result = false
  state.confirmationPopupProps.display = false
}

function applyConfirmationPopup () {
  state.confirmationPopupProps.result = true
  state.confirmationPopupProps.display = false
}

// ポップアップ - アカウントポップアップ

function openAccountPopup () {
  state.accountPopupDisplay = true
}

function closeAccountPopup () {
  state.accountPopupDisplay = false
}

// ポップアップ - 通知ポップアップ

function openNotificationPopup () {
  state.notificationPopupDisplay = true
}

function closeNotificationPopup () {
  state.notificationPopupDisplay = false
}

// ポップアップ - UI言語設定ポップアップ

function openUiLanguageSettingsPopup () {
  state.uiLanguageSettingsPopupDisplay = true
}

function closeUiLanguageSettingsPopup () {
  state.uiLanguageSettingsPopupDisplay = false
}

// ポップアップ - デザイン設定ポップアップ

function openDesignSettingsPopup () {
  state.designSettingsPopupDisplay = true
}

function closeDesignSettingsPopup () {
  state.designSettingsPopupDisplay = false
}

// ポップアップ - ポスト設定ポップアップ

function openPostSettingsPopup () {
  state.postSettingsPopupDisplay = true
}

function closePostSettingsPopup () {
  state.postSettingsPopupDisplay = false
}

// ポップアップ - 時間設定ポップアップ

function openTimeSettingsPopup () {
  state.timeSettingsPopupDisplay = true
}

function closeTimeSettingsPopup () {
  state.timeSettingsPopupDisplay = false
}

// ポップアップ - その他設定ポップアップ

function openOtherSettingsPopup () {
  state.otherSettingsPopupDisplay = true
}

function closeOtherSettingsPopup () {
  state.otherSettingsPopupDisplay = false
}

// ポップアップ - 招待コードポップアップ

function openInviteCodesPopup () {
  state.inviteCodesPopupDisplay = true
}

function closeInviteCodesPopup () {
  state.inviteCodesPopupDisplay = false
}

// ポップアップ - コンテンツ言語ポップアップ

function openContentLanguagesPopup () {
  state.contentLanguagesPopupDisplay = true
}

function closeContentLanguagesPopup () {
  state.contentLanguagesPopupDisplay = false
}

// ポップアップ - ポスト言語ポップアップ

function openPostLanguagesPopup () {
  state.postLanguagesPopupDisplay = true
}

function closePostLanguagesPopup () {
  state.postLanguagesPopupDisplay = false
}

// ポップアップ - ミュートユーザーリストポップアップ

function openMutingUsersPopup () {
  state.mutingUsersPopupDisplay = true
}

function closeMutingUsersPopup () {
  state.mutingUsersPopupDisplay = false
}

// ポップアップ - ブロックユーザーリストポップアップ

function openBlockingUsersPopup () {
  state.blockingUsersPopupDisplay = true
}

function closeBlockingUsersPopup () {
  state.blockingUsersPopupDisplay = false
}

// ポップアップ - ワードミュートポップアップ

function openWordMutePopup () {
  state.wordMutePopupDisplay = true
}

function closeWordMutePopup () {
  state.wordMutePopupDisplay = false
}

// ポップアップ - チャット一覧ポップアップ

function openChatListPopup () {
  state.chatListPopupProps.display = true
}

function closeChatListPopup () {
  state.chatListPopupProps.display = false
}

// ポップアップ - チャットルームポップアップ

function openChatConvoPopup (myConvo: TIMyConvo) {
  state.chatConvoPopupProps.myConvo = myConvo
  state.chatConvoPopupProps.display = true
}

function closeChatConvoPopup () {
  state.chatConvoPopupProps.display = false
}

// ポップアップ - チャットメンバー選択ポップアップ

function openChatMembersSelectPopup () {
  state.chatMembersSelectPopupProps.users.splice(0)
  state.chatMembersSelectPopupProps.display = true
}

function closeChatMembersSelectPopup () {
  state.chatMembersSelectPopupProps.display = false
}

// ポップアップ - ラベラー一覧ポップアップ

function openLabelerListPopup (title: string, labelers: Array<TILabeler>) {
  state.labelerListPopupProps.title = title
  state.labelerListPopupProps.labelers = labelers
  state.labelerListPopupProps.display = true
}

function closeLabelerListPopup () {
  state.labelerListPopupProps.display = false
}

// ポップアップ - ラベラー設定ポップアップ

function openLabelerSettingsPopup (labeler: TILabeler) {
  state.labelerSettingsPopupProps.labeler = labeler
  state.labelerSettingsPopupProps.display = true
}

function closeLabelerSettingsPopup () {
  state.labelerSettingsPopupProps.display = false
}

// ポップアップ - ラベル選択ポップアップ

function openSelectLabelsPopup (params: any) {
  state.selectLabelsPopupDisplay = true
  state.selectLabelsPopupState = params
}

function closeSelectLabelsPopup () {
  state.selectLabelsPopupDisplay = false
}

// ポップアップ - アカウントレポート送信ポップアップ

function openSendAccountReportPopup (user: TTUser) {
  state.sendAccountReportPopupProps.user = user
  state.sendAccountReportPopupProps.display = true
}

function closeSendAccountReportPopup () {
  state.sendAccountReportPopupProps.display = false
}

// ポップアップ - ポストレポート送信ポップアップ

function openSendPostReportPopup (post: TTPost) {
  state.sendPostReportPopupProps.post = post
  state.sendPostReportPopupProps.display = true
}

function closeSendPostReportPopup () {
  state.sendPostReportPopupProps.display = false
}

// ポップアップ - フィードレポート送信ポップアップ

function openSendFeedReportPopup (generator: TTFeedGenerator) {
  state.sendFeedReportPopupProps.generator = generator
  state.sendFeedReportPopupProps.display = true
}

function closeSendFeedReportPopup () {
  state.sendFeedReportPopupProps.display = false
}

// ポップアップ - リストレポート送信ポップアップ

function openSendListReportPopup (list: TTList) {
  state.sendListReportPopupProps.list = list
  state.sendListReportPopupProps.display = true
}

function closeSendListReportPopup () {
  state.sendListReportPopupProps.display = false
}

// ポップアップ - リポストユーザーポップアップ

async function openRepostUsersPopup (uri: string) {
  if (state.currentRepostUsersUri !== uri) {
    state.currentRepostUsers = []
    state.currentRepostUsersUri = uri
    state.currentRepostUsersCursor = undefined
  }
  state.repostUsersPopupDisplay = true
}

function closeRepostUsersPopup () {
  state.repostUsersPopupDisplay = false
}

// ポップアップ - 引用リポスト一覧ポップアップ

async function openQuoteRepostsPopup (uri: string) {
  if (state.currentQuoteRepostsUri !== uri) {
    state.currentQuoteReposts = []
    state.currentQuoteRepostsUri = uri
    state.currentQuoteRepostsCursor = undefined
  }
  state.quoteRepostsPopupDisplay = true
}

function closeQuoteRepostsPopup () {
  state.quoteRepostsPopupDisplay = false
}

// ポップアップ - いいねユーザーポップアップ

async function openLikeUsersPopup (uri: string) {
  if (state.currentLikeUsersUri !== uri) {
    state.currentLikeUsers = []
    state.currentLikeUsersUri = uri
    state.currentLikeUsersCursor = undefined
  }
  state.likeUsersPopupDisplay = true
}

function closeLikeUsersPopup () {
  state.likeUsersPopupDisplay = false
}

// ポップアップ - マイフィードポップアップ

function openMyFeedsPopup () {
  state.myFeedsPopupDisplay = true
}

function closeMyFeedsPopup () {
  state.myFeedsPopupDisplay = false
}

// ポップアップ - マイリストポップアップ

function openMyListPopup () {
  state.myListPopupDisplay = true
}

function closeMyListPopup () {
  state.myListPopupDisplay = false
}

// ポップアップ - リスト編集ポップアップ

function openListEditPopup (props: TTListEditPopupProps) {
  state.listEditPopupProps.mode = props.mode
  state.listEditPopupProps.list = props.list
  state.listEditPopupProps.callback = props.callback
  state.listEditPopupProps.display = true
}

function closeListEditPopup () {
  state.listEditPopupProps.display = false
}

// ポップアップ - リストユーザー管理ポップアップ

function openListUserManagementPopup (props: TTListUserManagementPopupProps) {
  state.listUserManagementPopupProps.user = props.user
  state.listUserManagementPopupProps.display = true
}

function closeListUserManagementPopup () {
  state.listUserManagementPopupProps.display = false
}

// ポップアップ - スターターパック編集ポップアップ
function openStarterPackEditPopup (props: TIStarterPackEditPopupProps) {
  state.starterPackEditPopupProps.mode = props.mode
  state.starterPackEditPopupProps.starterPack = props.starterPack
  state.starterPackEditPopupProps.display = true
}

function closeStarterPackEditPopup () {
  state.starterPackEditPopupProps.display = false
}

// ポップアップ - タイムフィードポップアップ

function openTimeFeedsPopup (post: TTPost, direction: "old" | "new") {
  state.currentTimeFeeds.splice(0)
  state.currentTimeFeeds.push(post)
  state.timeFeedsPopupProps = {
    targetPost: post,
    direction,
  }
  state.timeFeedsPopupDisplay = true
}

function closeTimeFeedsPopup () {
  state.timeFeedsPopupDisplay = false
}

// ポップアップ - カスタムブックマークポップアップ

function openCustomBookmarkPopup () {
  state.customBookmarkPopupDisplay = true
}

function closeCustomBookmarkPopup () {
  state.customBookmarkPopupDisplay = false
}

// ポップアップ - カスタムブックマーク管理ポップアップ

function openCustomBookmarkManagementPopup (props: TICustomBookmarkManagementPopupProps) {
  state.customBookmarkManagementPopupProps.post = props.post
  state.customBookmarkManagementPopupProps.display = true
}

function closeCustomBookmarkManagementPopup () {
  state.customBookmarkManagementPopupProps.display = false
}

// ポップアップ - ポスト送信ポップアップ

let isSendPostDone = false

async function openSendPostPopup (params?: TTSendPostPopupParams): Promise<boolean> {
  if (params != null) {
    state.sendPostPopupProps.type = params.type
    state.sendPostPopupProps.post = params.post
    state.sendPostPopupProps.text = params.text
    state.sendPostPopupProps.url = params.url
    state.sendPostPopupProps.fileList = params.fileList
    state.sendPostPopupProps.createdAt = params.createdAt
  }
  state.sendPostPopupProps.display = true
  state.sendPostPopupProps.visibility = true
  await Util.waitProp(() => state.sendPostPopupProps.visibility, false)
  return isSendPostDone
}

async function closeSendPostPopup (done: boolean, hidden: boolean) {
  isSendPostDone = done
  if (!hidden) {
    state.sendPostPopupProps.display = false

    // ポスト送信ポップアップの入力内容のリセット
    state.sendPostPopupProps.type = "post"
    state.sendPostPopupProps.url = undefined
    state.sendPostPopupProps.fileList = undefined
    state.postDatePopupDate = undefined
    state.listMentionPopupProps.list = undefined
    state.listMentionPopupProps.dids.splice(0)
  }
  state.sendPostPopupProps.visibility = false
}

// ポップアップ - マイワードポップアップ

function openMyWordPopup (props?: TIMyWordPopupProps) {
  state.myWordPopupProps.mode = props?.mode ?? "select"
  state.myWordPopupProps.display = true
}

function closeMyWordPopup () {
  state.myWordPopupProps.display = false
}

// ポップアップ - ポスト日時選択ポップアップ

function openPostDatePopup (_payload: MouseEvent) {
  state.postDatePopupDisplay = true
}

function closePostDatePopup () {
  state.postDatePopupDisplay = false
}

// ポップアップ - 反応制御ポップアップ

function openReactionControlPopup (props: TTReactionControlPopupProps) {
  state.reactionControlPopupProps.mode = props.mode
  state.reactionControlPopupProps.isReply = props.isReply
  state.reactionControlPopupProps.draftReactionControl = props.draftReactionControl
  state.reactionControlPopupProps.postThreadgate = props.postThreadgate
  state.reactionControlPopupProps.postUri = props.postUri
  state.reactionControlPopupProps.onClosed = props.onClosed
  state.reactionControlPopupProps.display = true
}

function closeReactionControlPopup (params: TICloseReactionControlPopupProps) {
  if (state.reactionControlPopupProps.onClosed != null) {
    state.reactionControlPopupProps.onClosed(params)
  }
  state.reactionControlPopupProps.display = false
}

// ポップアップ - リストメンションポップアップ

function openListMentionPopup () {
  state.listMentionPopupProps.dids.splice(0)
  state.listMentionPopupProps.display = true
}

function closeListMentionPopup () {
  state.listMentionPopupProps.display = false
}

// ポップアップ - HTML ポップアップ

function openHtmlPopup (type: string) {
  state.htmlPopupProps.type = type
  state.htmlPopupProps.display = true
}

function closeHtmlPopup () {
  state.htmlPopupProps.display = false
}

// ポップアップ - 進捗ポップアップ

function openProgressPopup (value = 0, message?: string) {
  state.progressPopupProps.value = value
  state.progressPopupProps.message = message
  state.progressPopupDisplay = true
}

function closeProgressPopup () {
  state.progressPopupDisplay = false
}
