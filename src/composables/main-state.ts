import endOfYesterday from "date-fns/endOfYesterday"
import format from "date-fns/format"
import intlFormatDistance from "date-fns/intlFormatDistance"
import isSameYear from "date-fns/isSameYear"
import { computed, reactive } from "vue"
import type { LocationQueryValue } from "vue-router"
import AtpWrapper from "@/composables/atp-wrapper"
import MyFeeds from "@/composables/main-state/my-feeds"
import MyLists from "@/composables/main-state/my-lists"
import MyWorker from "@/composables/main-state/my-worker"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"
import LABEL_BEHAVIORS from "@/consts/label_behaviors.json"
import LANGUAGES from "@/consts/languages"

export const state = reactive<MainState>({} as MainState)
state.$setCurrentLanguage = undefined
state.$getCurrentLanguage = undefined
state.atp = new AtpWrapper()
state.currentPath = ""
state.currentQuery = {}
state.mounted = false
state.loaderDisplay = false
state.centerLoaderDisplay = false
state.listLoaderDisplay = false
state.updateKey = 0
state.forceUpdate = forceUpdate
state.formatDate = formatDate

// D&D
state.isDragOver = false

// インフィニットスクロール用プロパティ
state.scrolledToBottom = false

// ブロードキャスト
state.broadcastChannel = new BroadcastChannel("klearsky")

// サーバ情報

state.currentServerInfo = undefined
state.fetchCurrentServerInfo = fetchCurrentServerInfo

// 設定

state.settings = {}
state.backgroundImage = computed((): string => {
  if (state.currentSetting?.backgroundImage == null) return ""
  const backgroundImage: string = state.currentSetting.backgroundImage
    .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;")
  return backgroundImage.match(/^\/|^\w+:\/+/)
    ? `url(${backgroundImage})`
    : backgroundImage
})
state.currentSetting = {}
state.resetSettings = resetSettings
state.updateSettings = updateSettings
state.saveSettings = saveSettings
state.updateCurrentLanguageSetting = updateCurrentLanguageSetting
state.updateColorThemeSetting = updateColorThemeSetting

// 設定 - 設定ポップオーバー

state.settingsPopoverDisplay = false
state.openSettingsPopover = openSettingsPopover
state.closeSettingsPopover = closeSettingsPopover

// 通知

state.notifications = []
state.notificationCursor = undefined
state.notificationCount = 0
state.notificationFetchedFirst = false
state.notificationPopupDisplay = false
state.notificationReasonFilter = undefined
state.fetchNotifications = fetchNotifications
state.openNotificationPopup = openNotificationPopup
state.closeNotificationPopup = closeNotificationPopup

// 通知タイマー

state.notificationTimer = null
state.clearNotificationInterval = clearNotificationInterval
state.updateNotifications = updateNotifications
state.updateNotificationInterval = updateNotificationInterval

// 招待コード

state.inviteCodes = []
state.numberOfInviteCodes = computed(() => {
  let total = 0
  state.inviteCodes.forEach((inviteCode: TTInviteCode) => {
    total += inviteCode.available
  })
  return total
})
state.numberOfAvailableInviteCodes = computed(() => {
  let total = 0
  state.inviteCodes.forEach((inviteCode: TTInviteCode) => {
    total += inviteCode.available - inviteCode.uses.length
  })
  return total
})
state.updateInviteCodes = async (): Promise<boolean> => {
  const inviteCodes = await state.atp.fetchInviteCodes()
  if (inviteCodes instanceof Error) return false
  state.inviteCodes.splice(0, state.inviteCodes.length, ...inviteCodes)
  return true
}

// 設定 - UI言語設定ポップアップ

state.uiLanguageSettingsPopupDisplay = false
state.openUiLanguageSettingsPopup = openUiLanguageSettingsPopup
state.closeUiLanguageSettingsPopup = closeUiLanguageSettingsPopup

// 設定 - デザイン設定ポップアップ

state.designSettingsPopupDisplay = false
state.openDesignSettingsPopup = openDesignSettingsPopup
state.closeDesignSettingsPopup = closeDesignSettingsPopup

// 設定 - ポスト設定ポップアップ

state.postSettingsPopupDisplay = false
state.openPostSettingsPopup = openPostSettingsPopup
state.closePostSettingsPopup = closePostSettingsPopup

// 設定 - 心理的安全性設定ポップアップ

state.psySafetySettingsPopupDisplay = false
state.openPsySafetySettingsPopup = openPsySafetySettingsPopup
state.closePsySafetySettingsPopup = closePsySafetySettingsPopup

// 設定 - その他設定ポップアップ

state.otherSettingsPopupDisplay = false
state.openOtherSettingsPopup = openOtherSettingsPopup
state.closeOtherSettingsPopup = closeOtherSettingsPopup

// 設定 - 招待コードポップアップ

state.inviteCodesPopupDisplay = false
state.openInviteCodesPopup = openInviteCodesPopup
state.closeInviteCodesPopup = closeInviteCodesPopup

// 設定 - 説明用ポップアップ

state.htmlPopupDisplay = false
state.htmlPopupType = undefined

// Preferences

state.currentPreferences = []
state.fetchPreferences = fetchPreferences

// コンテンツフィルタ

state.getConcernedPreferences = getConcernedPreferences
state.getContentWarningVisibility = getContentWarningVisibility

// ラベル

state.selectLabelsPopupDisplay = false
state.selectLabelsPopupState = undefined
state.hasLabel = hasLabel
state.getCustomLabels = getCustomLabels
state.filterLabels = filterLabels
state.openSelectLabelsPopup = openSelectLabelsPopup
state.closeSelectLabelsPopup = closeSelectLabelsPopup

// ミュートユーザー

state.currentMutingUsers = []
state.currentMutingUsersCursor = undefined

// ブロックユーザー

state.currentBlockingUsers = []
state.currentBlockingUsersCursor = undefined

// プロフィール

state.inSameProfilePage = false
state.profileFolding = false
state.currentProfile = null
resetProfileState(state)
state.userProfile = null
state.isMyProfile = isMyProfile
state.fetchUserProfile = fetchUserProfile
state.updateUserProfile = updateUserProfile
state.fetchCurrentProfile = fetchCurrentProfile
state.fetchCurrentAuthorCustomFeeds = fetchCurrentAuthorCustomFeeds
state.fetchCurrentAuthorFeed = fetchCurrentAuthorFeed
state.fetchAuthorReposts = fetchAuthorReposts
state.fetchAuthorLikes = fetchAuthorLikes
state.fetchAuthorLists = fetchAuthorLists
state.fetchFollowers = fetchFollowers
state.fetchFollowings = fetchFollowings
state.fetchSuggestedFollows = fetchSuggestedFollows
state.fetchSuggestions = fetchSuggestions

// ポストスレッド

state.currentPosts = []
state.fetchPostThread = fetchPostThread

// フォロー中フィード

state.timelineFeeds = []
state.timelineCursor = undefined
state.fetchTimeline = fetchTimeline

// 検索

// 検索 - 現在の検索キーワード
state.currentSearchTerm = ""

// 検索 - 現在のポスト検索結果
state.currentSearchPostResults = []
state.currentSearchPostCursor = undefined
state.currentSearchPostsLastTerm = undefined
state.fetchSearchPosts = fetchSearchPosts

// 検索 - 現在のフィード検索結果
state.currentSearchFeeds = []
state.currentSearchFeedsCursor = undefined
state.currentSearchFeedsLastTerm = undefined
state.fetchSearchFeeds = fetchSearchFeeds

// 検索 - 現在のおすすめユーザー検索結果
state.currentSearchSuggestionResults = []
state.currentSearchSuggestionCursor = undefined

// 検索 - 現在のユーザー検索結果
state.currentSearchUsers = []
state.currentSearchUsersCursor = undefined
state.currentSearchLastUserTerm = undefined

// 検索 - タグ付けされた提案
state.currentTaggedSuggestions = []
state.currentTaggedProfiles = {}

// カスタムフィード

state.currentCustomUri = undefined
state.currentCustomFeeds = []
state.currentCustomCursor = undefined
state.currentPopularFeedGenerators = []
state.currentPopularFeedGeneratorsCursor = undefined
state.feedPreferences = computed((): undefined | TTPreference => {
  return state.currentPreferences.find((preference: TTPreference) => {
    return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
  })
})
state.fetchCustomFeeds = fetchCustomFeeds
state.fetchPopularFeedGenerators = fetchPopularFeedGenerators
state.sortFeedPreferencesSavedAndPinned = sortFeedPreferencesSavedAndPinned

// マイフィード
state.myFeeds = new MyFeeds(state)

// リスト

state.currentList = undefined
state.currentListItems = []
state.currentListItemsCursor = undefined
state.currentListFeeds = []
state.currentListFeedsCursor = undefined
state.fetchCurrentList = fetchCurrentList
state.fetchCurrentListItems = fetchCurrentListItems
state.fetchCurrentListFeeds = fetchCurrentListFeeds

// マイリスト

state.myLists = new MyLists(state)

// グローバルライン

state.globallinePosts = []
state.globallineProfiles = {}
state.globallineNumberOfPosts = 0

// ポップオーバー

// ポップオーバー - プロフィールポップオーバー
state.profilePopoverProps = {
  display: false,
  isUser: false,
  user: undefined,
}
state.profilePopoverSelector = undefined
state.openProfilePopover = openProfilePopover
state.closeProfilePopover = closeProfilePopover

// ポップオーバー - ポストポップオーバー
state.postPopoverProps = {
  display: false,
  post: undefined,
}
state.postPopoverSelector = undefined
state.postPopoverCallback = undefined
state.openPostPopover = openPostPopover
state.closePostPopover = closePostPopover

// ポップオーバー - リポストポップオーバー
state.repostPopoverProps = {
  display: false,
  post: undefined,
}
state.repostPopoverSelector = undefined
state.repostPopoverCallback = undefined
state.openRepostPopover = openRepostPopover
state.closeRepostPopover = closeRepostPopover

// ポップオーバー - フィードカードポップオーバー
state.feedCardPopoverProps = {
  display: false,
  generator: undefined,
}
state.feedCardPopoverSelector = undefined
state.openFeedCardPopover = openFeedCardPopover
state.closeFeedCardPopover = closeFeedCardPopover

// ポップオーバー - リストカードポップオーバー
state.listCardPopoverProps = {
  display: false,
  list: undefined,
}
state.listCardPopoverSelector = undefined
state.listCardPopoverCallback = undefined
state.openListCardPopover = openListCardPopover
state.closeListCardPopover = closeListCardPopover

// ポップオーバー - マイフィードソートポップオーバー
state.myFeedsSortPopoverProps = {
  display: false,
}
state.myFeedsSortPopoverSelector = undefined
state.myFeedsSortPopoverCallback = undefined
state.openMyFeedsSortPopover = openMyFeedsSortPopover
state.closeMyFeedsSortPopover = closeMyFeedsSortPopover

// ポップオーバー - キーワード履歴ポップオーバー
state.keywordHistoryPopoverProps = {
  display: false,
  kind: undefined,
  selector: undefined,
  keywords: [],
}
state.openKeywordHistoryPopover = openKeywordHistoryPopover
state.closeKeywordHistoryPopover = closeKeywordHistoryPopover
state.addKeywordHistory = addKeywordHistory

// ポップアップ

// ポップアップ - エラーポップアップ
state.errorPopupProps = {
  display: false,
  error: undefined,
  description: undefined,
}
state.openErrorPopup = openErrorPopup
state.closeErrorPopup = closeErrorPopup

// ポップアップ - メッセージポップアップ
state.messagePopupProps = {
  display: false,
  title: undefined,
  text: undefined,
  hasTranslateLink: false,
}
state.openMessagePopup = openMessagePopup
state.closeMessagePopup = closeMessagePopup

// ポップアップ - 確認ポップアップ
state.confirmationPopupDisplay = false
state.confirmationPopupTitle = undefined
state.confirmationPopupText = undefined
state.confirmationPopupDetail = undefined
state.confirmationPopupResult = false
state.openConfirmationPopup = openConfirmationPopup
state.closeConfirmationPopup = closeConfirmationPopup
state.applyConfirmationPopup = applyConfirmationPopup

// ポップアップ - ログインポップアップ
state.loginPopupDisplay = false
state.loginPopupAutoDisplay = computed((): boolean => {
  return state.mounted && (!state.atp.hasLogin() || state.loginPopupDisplay)
})

// ポップアップ - アカウントポップアップ
state.accountPopupDisplay = false
state.openAccountPopup = openAccountPopup
state.closeAccountPopup = closeAccountPopup

// ポップアップ - コンテンツ言語ポップアップ
state.contentLanguagesPopupDisplay = false
state.openContentLanguagesPopup = openContentLanguagesPopup
state.closeContentLanguagesPopup = closeContentLanguagesPopup

// ポップアップ - ポスト言語ポップアップ
state.postLanguagesPopupDisplay = false
state.openPostLanguagesPopup = openPostLanguagesPopup
state.closePostLanguagesPopup = closePostLanguagesPopup

// ポップアップ - コンテンツフィルタリングポップアップ
state.contentFilteringPopupDisplay = false
state.openContentFilteringPopup = openContentFilteringPopup
state.closeContentFilteringPopup = closeContentFilteringPopup

// ポップアップ - ミュートユーザーリストポップアップ
state.mutingUsersPopupDisplay = false
state.openMutingUsersPopup = openMutingUsersPopup
state.closeMutingUsersPopup = closeMutingUsersPopup

// ポップアップ - ブロックユーザーリストポップアップ
state.blockingUsersPopupDisplay = false
state.openBlockingUsersPopup = openBlockingUsersPopup
state.closeBlockingUsersPopup = closeBlockingUsersPopup

// ポップアップ - ワードミュートポップアップ
state.wordMutePopupDisplay = false
state.openWordMutePopup = openWordMutePopup
state.closeWordMutePopup = closeWordMutePopup

// ポップアップ - アカウントレポート送信ポップアップ
state.sendAccountReportPopupProps = {
  display: false,
  user: undefined,
}
state.openSendAccountReportPopup = openSendAccountReportPopup
state.closeSendAccountReportPopup = closeSendAccountReportPopup

// ポップアップ - ポストレポート送信ポップアップ
state.sendPostReportPopupProps = {
  display: false,
  post: undefined,
}
state.openSendPostReportPopup = openSendPostReportPopup
state.closeSendPostReportPopup = closeSendPostReportPopup

// ポップアップ - フィードレポート送信ポップアップ
state.sendFeedReportPopupProps = {
  display: false,
  generator: undefined,
}
state.openSendFeedReportPopup = openSendFeedReportPopup
state.closeSendFeedReportPopup = closeSendFeedReportPopup

// ポップアップ - リストレポート送信ポップアップ
state.sendListReportPopupProps = {
  display: false,
  list: undefined,
}
state.openSendListReportPopup = openSendListReportPopup
state.closeSendListReportPopup = closeSendListReportPopup

// ポップアップ - イメージポップアップ
state.imagePopupProps = {
  did: "",
  images: [],
  alts: [],
  index: 0,
  display: false,
}

// ポップアップ - リポストユーザーポップアップ
state.currentRepostUsers = []
state.currentRepostUsersUri = undefined
state.currentRepostUsersCursor = undefined
state.repostUsersPopupDisplay = false
state.openRepostUsersPopup = openRepostUsersPopup
state.closeRepostUsersPopup = closeRepostUsersPopup

// ポップアップ - いいねユーザーポップアップ
state.currentLikeUsers = []
state.currentLikeUsersUri = undefined
state.currentLikeUsersCursor = undefined
state.likeUsersPopupDisplay = false
state.openLikeUsersPopup = openLikeUsersPopup
state.closeLikeUsersPopup = closeLikeUsersPopup

// ポップアップ - マイフィードポップアップ
state.myFeedsPopupDisplay = false
state.openMyFeedsPopup = openMyFeedsPopup
state.closeMyFeedsPopup = closeMyFeedsPopup

// ポップアップ - マイリストポップアップ
state.myListPopupDisplay = false
state.openMyListPopup = openMyListPopup
state.closeMyListPopup = closeMyListPopup

// ポップアップ - リスト編集ポップアップ
state.listEditPopupProps = {
  mode: undefined,
  display: false,
  list: undefined,
}
state.openListEditPopup = openListEditPopup
state.closeListEditPopup = closeListEditPopup

// ポップアップ - リストユーザー管理ポップアップ
state.listUserManagementPopupProps = {
  display: false,
  user: undefined,
}
state.openListUserManagementPopup = openListUserManagementPopup
state.closeListUserManagementPopup = closeListUserManagementPopup

// ポップアップ - タイムフィードポップアップ
state.currentTimeFeeds = []
state.timeFeedsPopupDisplay = false
state.timeFeedsPopupProps = undefined
state.openTimeFeedsPopup = openTimeFeedsPopup
state.closeTimeFeedsPopup = closeTimeFeedsPopup

// ポップアップ - ポスト送信ポップアップ
state.sendPostPopupProps = {
  display: false,
  type: "post",
  post: undefined,
  fileList: undefined,
  createdAt: undefined,
}
state.openSendPostPopup = openSendPostPopup
state.closeSendPostPopup = closeSendPostPopup

// ポップアップ - マイタグポップアップ
state.currentPostTags = []
state.myTagPopupProps = {
  display: false,
  mode: "select",
}
state.openMyTagPopup = openMyTagPopup
state.closeMyTagPopup = closeMyTagPopup

// ポップアップ - ポスト日時選択ポップアップ
state.postDatePopupDisplay = false
state.postDatePopupDate = undefined
state.openPostDatePopup = openPostDatePopup
state.closePostDatePopup = closePostDatePopup

// ポップアップ - Threadgate ポップアップ
state.threadgatePopupProps = {
  display: false,
  postThreadgate: undefined,
  postUri: undefined,
}
state.openThreadgatePopup = openThreadgatePopup
state.closeThreadgatePopup = closeThreadgatePopup

// ポップアップ - 進捗ポップアップ
state.progressPopupDisplay = false
state.progressPopupProps = {
  value: 0,
  message: undefined,
}
state.openProgressPopup = openProgressPopup
state.closeProgressPopup = closeProgressPopup

// MyWorker
state.myWorker = new MyWorker(state)

export function resetProfileState (state: MainState) {
  resetArray(state, "currentAuthorFeeds")
  state.currentAuthorFeedsCursor = undefined
  resetArray(state, "currentAuthorFeedsWithReplies")
  state.currentAuthorFeedsWithRepliesCursor = undefined
  resetArray(state, "currentAuthorFeedsWithMedia")
  state.currentAuthorFeedsWithMediaCursor = undefined
  resetArray(state, "currentAuthorCustomFeeds")
  state.currentAuthorCustomFeedsCursor = undefined
  resetArray(state, "currentAuthorReposts")
  state.currentAuthorRepostsCursor = undefined
  resetArray(state, "currentAuthorLikes")
  state.currentAuthorLikesCursor = undefined
  resetArray(state, "currentAuthorLists")
  state.currentAuthorListsCursor = undefined
  resetArray(state, "currentFollowers")
  state.currentFollowersCursor = undefined
  resetArray(state, "currentFollowings")
  state.currentFollowingsCursor = undefined
  resetArray(state, "currentSuggestedFollows")
}

function resetArray (state: any, key: string) {
  state[key] == null
    ? state[key] = []
    : state[key].splice(0)
}

function forceUpdate () {
  state.updateKey = new Date().getTime()
}

function formatDate (dateString?: string): string {
  if (dateString == null) return ""
  const now = new Date()
  const the = new Date(dateString)

  // 今日
  if (endOfYesterday() < the) {
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
  const response = await state.atp.fetchServerInfo()
  if (response instanceof Error) return
  state.currentServerInfo = response
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
  updateNotificationInterval()
  updateColorThemeSetting()
}

function saveSettings () {
  const did = state.atp.session?.did
  if (did == null) return
  if (state.settings[did] == null)
    state.settings[did] = {}
  if (state.settings[did].uiLanguage == null)
    state.settings[did].uiLanguage = state.$getCurrentLanguage != null
      ? state.$getCurrentLanguage()
      : window.navigator.language
  if (state.settings[did].autoTranslation == null)
    state.settings[did].autoTranslation = false
  if (state.settings[did].autoTranslationIgnoreLanguage == null)
    state.settings[did].autoTranslationIgnoreLanguage = undefined
  if (state.settings[did].contentLanguages == null)
    state.settings[did].contentLanguages = []
  else state.settings[did].contentLanguages = getSanitizedLanguages(state.settings[did].contentLanguages)
  if (state.settings[did].fontSize == null)
    state.settings[did].fontSize = "medium"
  if (state.settings[did].fontKerning == null)
    state.settings[did].fontKerning = false
  if (state.settings[did].fontAntialiasing == null)
    state.settings[did].fontAntialiasing = true
  if (state.settings[did].notificationFetchInterval == null)
    state.settings[did].notificationFetchInterval = 15000
  if (state.settings[did].tags == null)
    state.settings[did].tags = []
  if (state.settings[did].wordMute == null)
    state.settings[did].wordMute = []
  if (state.settings[did].replyFolding == null)
    state.settings[did].replyFolding = [4]
  if (state.settings[did].repostFolding == null)
    state.settings[did].repostFolding = [1, 2, 5]
  if (state.settings[did].timeControl == null)
    state.settings[did].timeControl = "relative"
  if (state.settings[did].imageFolding == null)
    state.settings[did].imageFolding = "none"
  if (state.settings[did].imageMaxHeightRatio == null)
    state.settings[did].imageMaxHeightRatio = 1.5
  if (state.settings[did].imageAutoPlay == null)
    state.settings[did].imageAutoPlay = true
  if (state.settings[did].linkcardEmbeddedControl == null)
    state.settings[did].linkcardEmbeddedControl = [
      "applemusic",
      "giphy",
      "graysky",
      "spotify",
      "twitch",
      "youtube",
      "vimeo",
      "nicovideo",
    ]
  if (state.settings[did].globallineLayout == null)
    state.settings[did].globallineLayout = "post"
  if (state.settings[did].colorTheme == null)
    state.settings[did].colorTheme = "auto"
  if (state.settings[did].mainAreaOpacity == null)
    state.settings[did].mainAreaOpacity = 1.0
  if (state.settings[did].backgroundImage == null)
    state.settings[did].backgroundImage = undefined
  if (state.settings[did].backgroundOpacity == null)
    state.settings[did].backgroundOpacity = 0.5
  if (state.settings[did].hideNotificationBadge == null)
    state.settings[did].hideNotificationBadge = false
  if (state.settings[did].hideNumberOfReaction == null)
    state.settings[did].hideNumberOfReaction = false
  if (state.settings[did].myFeedsIndex == null)
    state.settings[did].myFeedsIndex = []
  if (state.settings[did].postAnonymization == null)
    state.settings[did].postAnonymization = false
  if (state.settings[did].postLanguages == null)
    state.settings[did].postLanguages = [Util.getUserLanguage()]
  else state.settings[did].postLanguages = getSanitizedLanguages(state.settings[did].postLanguages)
  if (state.settings[did].postSearchKeywordHistory == null)
    state.settings[did].postSearchKeywordHistory = []
  if (state.settings[did].lightning == null)
    state.settings[did].lightning = undefined
  state.currentSetting = state.settings[did]
  Util.saveStorage("settings", state.settings)
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

function clearNotificationInterval () {
  if (state.notificationTimer != null) {
    clearInterval(state.notificationTimer)
    state.notificationTimer = null
  }
}

function updateNotificationInterval () {
  state.clearNotificationInterval()
  if (state.currentSetting.notificationFetchInterval === 0) return
  // @ts-ignore // TODO:
  state.notificationTimer = setInterval(
    state.updateNotifications,
    state.currentSetting.notificationFetchInterval ?? CONSTS.DEFAULT_NOTIFICATION_FETCH_INTERVAL
  )
}

async function updateNotifications () {
  const count = await state.atp.fetchNotificationCount() ?? 0
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

function updateColorThemeSetting () {
  if (state.currentSetting?.colorTheme != null) {
    window.document.documentElement.setAttribute(
      "data-color-theme",
      state.currentSetting.colorTheme as string
    )
  }
}

// 設定 - 設定ポップオーバー

function openSettingsPopover (selector: string, direction: "toRight" | "toUp") {
  state.settingsPopoverSelector = selector
  state.settingsPopoverDirection = direction
  state.settingsPopoverDisplay = true
}

function closeSettingsPopover () {
  state.settingsPopoverDisplay = false
}

// 通知

async function fetchNotifications (limit: number, direction: "new" | "old") {
  const result: undefined | false | {
    cursor?: string
    newNotificationCount: number
  } = await state.atp.fetchNotifications(
    state.notifications,
    limit,
    direction === "new" ? undefined : state.notificationCursor
  )
  if (result === false) {
    state.openErrorPopup("errorApiFailed", "main-state/fetchNotifications")
  } else if (result != null) {
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
}

function openNotificationPopup () {
  state.notificationPopupDisplay = true
}

function closeNotificationPopup () {
  state.notificationPopupDisplay = false
}

// 設定 - UI言語設定ポップアップ

function openUiLanguageSettingsPopup () {
  state.uiLanguageSettingsPopupDisplay = true
}

function closeUiLanguageSettingsPopup () {
  state.uiLanguageSettingsPopupDisplay = false
}

// 設定 - デザイン設定ポップアップ

function openDesignSettingsPopup () {
  state.designSettingsPopupDisplay = true
}

function closeDesignSettingsPopup () {
  state.designSettingsPopupDisplay = false
}

// 設定 - ポスト設定ポップアップ

function openPostSettingsPopup () {
  state.postSettingsPopupDisplay = true
}

function closePostSettingsPopup () {
  state.postSettingsPopupDisplay = false
}

// 設定 - 心理的安全性設定ポップアップ

function openPsySafetySettingsPopup () {
  state.psySafetySettingsPopupDisplay = true
}

function closePsySafetySettingsPopup () {
  state.psySafetySettingsPopupDisplay = false
}

// 設定 - その他設定ポップアップ

function openOtherSettingsPopup () {
  state.otherSettingsPopupDisplay = true
}

function closeOtherSettingsPopup () {
  state.otherSettingsPopupDisplay = false
}

// 設定 - 招待コードポップアップ

function openInviteCodesPopup () {
  state.inviteCodesPopupDisplay = true
}

function closeInviteCodesPopup () {
  state.inviteCodesPopupDisplay = false
}

// Preferences

async function fetchPreferences (): Promise<boolean> {
  const preferences = await state.atp.fetchPreferences()
  if (preferences == null) return false
  state.currentPreferences.splice(0, state.currentPreferences.length, ...preferences)
  return true
}

// コンテンツフィルタ

function getContentWarningVisibility (labels?: Array<TTLabel>): TTContentVisibility {
  const preferences = state.getConcernedPreferences(labels)
  for (const preference of preferences) {
    if (preference.visibility === "hide") return "hide"
  }
  for (const preference of preferences) {
    if (preference.visibility === "warn") return "warn"
  }
  return "show"
}

// label に該当する preference を取得する
function getConcernedPreferences (labels?: Array<TTLabel>): Array<TTPreference> {
  if (labels == null) return []
  const concernedPreferences = labels
    .map((label: TTLabel): TTPreference => {
      const val = Object.keys(LABEL_BEHAVIORS).find((k: string) => k === label.val)
      if (val == null) return makeCustomLabelPreference(label.val)
      return state.currentPreferences.find((preference: TTPreference) => {
        return preference.$type === "app.bsky.actor.defs#contentLabelPref" &&
          preference.label === LABEL_BEHAVIORS[val].oldGroup &&
          preference.visibility !== "show"
      }) ?? makeCustomLabelPreference(label.val)
    })
  return concernedPreferences
}

function makeCustomLabelPreference (label: string): TTPreference {
  const visibility = label === "!hide"
    ? "hide"
    : LABEL_BEHAVIORS[label]?.configurable === false
      ? "warn"
      : "show"
  return {
    $type: "app.bsky.actor.defs#contentLabelPref",
    label,
    visibility,
  }
}

// ラベル

function hasLabel (target: string, labels?: Array<TTLabel>): boolean {
  return (labels?.findIndex((label: TTLabel) => {
    return label.val === target
  }) ?? - 1) !== - 1
}

function getCustomLabels (labels?: Array<TTLabel>): Array<TTLabel> {
  return labels?.filter((label: TTLabel) => {
    return LABEL_BEHAVIORS[label.val] == null
  }) ?? []
}

function filterLabels (
  visibilities?: Array<TTContentVisibility>,
  warns?: Array<TTLabelOnWarn>,
  labels?: Array<TTLabel>
): Array<TTLabel> {
  const results = labels?.filter((label: TTLabel) => {
    const labelBehavior = LABEL_BEHAVIORS[label.val]

    // configurable ではないビルトインラベルの処理
    if (labelBehavior?.configurable === false) {
      const specifiedHide = visibilities?.indexOf("hide") !== - 1
      if (label.val === "!hide" && specifiedHide) return true

      const specifiedWarn = visibilities?.indexOf("warn") !== - 1
      if (label.val === "!warn" && specifiedWarn) return true

      if (labelBehavior?.group === "legal" &&
        (specifiedHide || specifiedWarn)
      ) return true

      if (label.val === "!no-unauthenticated") return false
    }

    return state.currentPreferences.some((preference: TTPreference) => {
      return preference.$type === "app.bsky.actor.defs#contentLabelPref" &&
        (
          labelBehavior?.oldGroup === "" ||
          preference.label === labelBehavior?.oldGroup
        ) &&
        (
          labelBehavior.configurable && (
            visibilities == null ||
            visibilities.indexOf(preference.visibility as TTContentVisibility) !== - 1
          )
        ) &&
        (
          warns == null ||
          warns.indexOf(labelBehavior.warn) !== - 1
        )
    })
  }) ?? []

  // 重複削除
  return results.filter((label: TTLabel, index: number) => {
    return results?.findIndex((target: TTLabel) => {
      return target.val === label.val
    }) === index
  })
}

function openSelectLabelsPopup (params: any) {
  state.selectLabelsPopupDisplay = true
  state.selectLabelsPopupState = params
}

function closeSelectLabelsPopup () {
  state.selectLabelsPopupDisplay = false
}

// プロフィール

function isMyProfile (): boolean {
  const account = state.currentQuery.account as LocationQueryValue
  return account === state.atp.session?.handle ||
         account === state.atp.session?.did
}

async function fetchUserProfile () {
  const userProfile = await state.atp.fetchProfile(state.atp.session?.handle as string)
  if (userProfile instanceof Error) {
    state.userProfile = null
    return
  }
  state.userProfile = userProfile

  // 現在のセッションにアバター画像を設定
  if (state.atp.session != null && state.userProfile?.avatar != null)
    state.atp.session.__avatar = state.userProfile?.avatar
}

async function updateUserProfile (profile: TTUpdateProfileParams) {
  state.loaderDisplay = true
  const response = await state.atp.updateProfile(profile)
  state.loaderDisplay = false
  if (response instanceof Error) {
    state.openErrorPopup(
      response,
      "main-state/updateUserProfile"
    )
  }
}

async function fetchCurrentProfile (did: string) {
  state.currentProfile = null
  state.currentAuthorReposts.splice(0)
  state.currentAuthorLikes.splice(0)
  state.currentAuthorLists.splice(0)
  state.currentAuthorCustomFeeds.splice(0)
  state.currentFollowers.splice(0)
  state.currentFollowings.splice(0)
  state.currentSuggestedFollows.splice(0)
  const currentProfile = await state.atp.fetchProfile(did)
  if (currentProfile instanceof Error) {
    state.currentProfile = null
    return
  }
  state.currentProfile = currentProfile
  state.currentProfile.__isDidPlc = state.currentProfile.did.startsWith("did:plc:")
  if (did === state.atp.session?.did) {
    state.userProfile = state.currentProfile

    // セッションキャッシュの設定
    state.myWorker.setSessionCache("userProfile", state.userProfile)
  }

  // ハンドル履歴と利用開始日の取得（非同期で良い）
  updateCurrentLogAudit()
}

async function updateCurrentLogAudit () {
  if (!state.currentProfile?.__isDidPlc) return
  const logJson = await state.atp.fetchLogAudit(state.currentProfile.did)
  if (logJson == null) return
  if (state.currentProfile == null) return // await　中に初期化される恐れがあるため
  state.currentProfile.__createdAt = Array.isArray(logJson)
    ? logJson.at(- 1)?.createdAt
    : undefined
  state.currentProfile.__log = logJson
}

async function fetchCurrentAuthorCustomFeeds (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor: Error | undefined | string =
    await state.atp.fetchAuthorCustomFeeds(
      state.currentAuthorCustomFeeds as Array<TTFeedGenerator>,
      account,
      CONSTS.LIMIT_OF_FETCH_AUTHOR_CUSTOM_FEEDS,
      direction === "old" ? state.currentAuthorCustomFeedsCursor : undefined
    )
  if (cursor instanceof Error) return
  if (cursor != null) state.currentAuthorCustomFeedsCursor = cursor
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

  const resultCursor: undefined | string =
    await state.atp.fetchAuthorFeed(
      feeds as Array<TTFeed>,
      account,
      CONSTS.LIMIT_OF_FETCH_AUTHOR_FEEDS,
      direction === "old" ? cursor : middleCursor,
      filter ?? "posts_no_replies",
      direction
    )
  if (resultCursor != null)
    filter === "posts_with_replies"
      ? state.currentAuthorFeedsWithRepliesCursor = resultCursor
      : filter === "posts_with_media" 
        ? state.currentAuthorFeedsWithMediaCursor = resultCursor
        : state.currentAuthorFeedsCursor = resultCursor
}

async function fetchAuthorReposts (direction: TTDirection) {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return
  const cursor: undefined | string = await state.atp.fetchAuthorReposts(
    state.currentAuthorReposts,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_REPOSTS,
    direction === "new" ? undefined : state.currentAuthorRepostsCursor
  )
  state.currentAuthorRepostsCursor = cursor
}

async function fetchAuthorLikes (direction: TTDirection) {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return
  const cursor: undefined | string = await state.atp.fetchAuthorLikes(
    state.currentAuthorLikes,
    account,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_LIKES,
    direction === "new" ? undefined : state.currentAuthorLikesCursor
  )
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
    return
  }
  state.currentAuthorListsCursor = cursor
}

async function fetchFollowers (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor: undefined | string = await state.atp.fetchFollowers(
    state.currentFollowers,
    account,
    CONSTS.LIMIT_OF_FETCH_FOLLOWS,
    direction === "new" ? undefined : state.currentFollowersCursor
  )
  state.currentFollowersCursor = cursor
}

async function fetchFollowings (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor: undefined | string = await state.atp.fetchFollowings(
    state.currentFollowings,
    account,
    CONSTS.LIMIT_OF_FETCH_FOLLOWS,
    direction === "new" ? undefined : state.currentFollowingsCursor
  )
  state.currentFollowingsCursor = cursor
}

async function fetchSuggestedFollows () {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return
  await state.atp.fetchSuggestedFollows(state.currentSuggestedFollows, account)
}

async function fetchSuggestions (direction: "new" | "old") {
  state.currentSearchSuggestionCursor =
    await state.atp.fetchSuggestions(
      state.currentSearchSuggestionResults,
      CONSTS.LIMIT_OF_FETCH_SUGGESTION_SEARCH,
      direction === "new" ? undefined : state.currentSearchSuggestionCursor
    )
}

// ポストスレッド

async function fetchPostThread () {
  let uri = state.currentQuery.uri as LocationQueryValue
  if (!uri) {
    // uri パラメータがない場合は handle と rkey パラメータがあるものとみなす
    const handle = state.currentQuery.handle as LocationQueryValue
    const rkey = state.currentQuery.rkey as LocationQueryValue
    if (!handle || !rkey) return
    const did = await state.atp.fetchDid(handle)
    if (did instanceof Error) return
    uri = `at://${did}/app.bsky.feed.post/${rkey}`
  }
  state.currentPosts?.splice(0)
  const posts = await state.atp.fetchPostThread(uri, CONSTS.LIMIT_OF_FETCH_POST_THREAD) ?? []
  if (posts) state.currentPosts = posts
}

// フォロー中フィード

async function fetchTimeline (direction: TTDirection, middleCursor?: string) {
  const cursor: undefined | false | string =
    await state.atp.fetchTimeline(
      state.timelineFeeds,
      state.currentSetting.replyFolding,
      state.currentSetting.repostFolding,
      CONSTS.LIMIT_OF_FETCH_FEEDS,
      direction === "old" ? state.timelineCursor : middleCursor,
      direction
    )
  if (cursor === false) state.openErrorPopup("errorApiFailed", "main-state/fetchTimeline")
  else if (cursor != null) state.timelineCursor = cursor
}

// 検索

// 検索 - 現在のポスト検索結果
async function fetchSearchPosts (cursor?: string) {
  // `from:me` 対応
  const q = state.currentSearchTerm
    .replace(/(?:^|\s)from:me(?=$|\s)/g, (substring: string) => {
      if (state.atp.session?.handle == null) {
        return substring.replace("from:me", "")
      }
      return substring.replace("me", state.atp.session.handle)
    })

  const newCursor: Error | undefined | string =
    await state.atp.fetchPostSearch(
      state.currentSearchPostResults,
      q,
      CONSTS.LIMIT_OF_FETCH_POST_SEARCH,
      cursor
    )
  if (newCursor instanceof Error) {
    state.openErrorPopup(
      "errorApiFailed",
      "main-state/fetchSearchPosts"
    )
    return
  }
  if (newCursor == null) return
  state.currentSearchPostCursor = newCursor
}

// 検索 - 現在のフィード検索結果
async function fetchSearchFeeds (direction: "old" | "new") {
  const cursor: Error | undefined | string =
    await state.atp.fetchPopularFeedGenerators(
      state.currentSearchFeeds,
      CONSTS.LIMIT_OF_FETCH_POPULAR_FEED_GENERATORS,
      direction === "old" ? state.currentSearchFeedsCursor : undefined,
      state.currentSearchTerm
    )
  if (cursor instanceof Error) state.openErrorPopup(
    "errorApiFailed",
    "main-state/fetchSearchFeeds"
  )
  else if (cursor != null) state.currentSearchFeedsCursor = cursor
}

// カスタムフィード

async function fetchCustomFeeds (direction: TTDirection, middleCursor?: string) {
  if (state.currentCustomUri !== state.currentQuery.feed) {
    state.currentCustomFeeds.splice(0)
    state.currentCustomCursor = undefined
  }
  const cursor: undefined | string | Error =
    await state.atp.fetchCustomFeeds(
      state.currentCustomFeeds,
      state.currentQuery.feed,
      CONSTS.LIMIT_OF_FETCH_FEEDS,
      direction === "old" ? state.currentCustomCursor : middleCursor,
      direction,
      (feedUri: any): boolean => feedUri === state.currentQuery.feed,
    )
  if (cursor instanceof Error) state.openErrorPopup(cursor, "main-state/fetchCustomFeeds")
  else if (cursor != null) state.currentCustomCursor = cursor
  state.currentCustomUri = state.currentQuery.feed
}

async function fetchPopularFeedGenerators (direction: "old" | "new") {
  const cursor: Error | undefined | string =
    await state.atp.fetchPopularFeedGenerators(
      state.currentPopularFeedGenerators,
      CONSTS.LIMIT_OF_FETCH_POPULAR_FEED_GENERATORS,
      direction === "old" ? state.currentPopularFeedGeneratorsCursor : undefined
    )
  if (cursor instanceof Error) state.openErrorPopup(
    "errorApiFailed",
    "main-state/fetchPopularFeedGenerators"
  )
  else if (cursor != null) state.currentPopularFeedGeneratorsCursor = cursor
}

function sortFeedPreferencesSavedAndPinned () {
  if (state.feedPreferences?.saved != null)
    state.feedPreferences.saved = state.myFeeds.savedUris
  if (state.feedPreferences?.pinned != null)
    state.feedPreferences.pinned = state.myFeeds.pinnedUris
}

// リスト

async function fetchCurrentList (listUri: string): Promise<boolean> {
  const response: TTList | Error =
    await state.atp.fetchList(listUri)
  if (response instanceof Error) {
    state.openErrorPopup(
      "errorApiFailed",
      "main-state/fetchList"
    )
    return false
  }
  state.currentList = response
  return true
}

async function fetchCurrentListItems (direction: "old" | "new"): Promise<boolean> {
  if (state.currentList == null) return false
  const cursor: undefined | string | Error =
    await state.atp.fetchListItems(
      state.currentListItems,
      state.currentList.uri,
      CONSTS.LIMIT_OF_FETCH_LIST_ITEMS,
      direction === "old" ? state.currentListItemsCursor : undefined
    )
  if (cursor instanceof Error) {
    state.openErrorPopup(
      "errorApiFailed",
      "main-state/fetchListItems"
    )
    return false
  }
  if (cursor != null) {
    state.currentListItemsCursor = cursor
  }
  return true
}

async function fetchCurrentListFeeds (direction: TTDirection, middleCursor?: string): Promise<boolean> {
  if (state.currentList == null) return false
  const cursor: undefined | string | Error =
    await state.atp.fetchListFeed(
      state.currentListFeeds,
      state.currentList.uri,
      CONSTS.LIMIT_OF_FETCH_LIST_FEEDS,
      direction === "old" ? state.currentListFeedsCursor : middleCursor,
      direction,
      (listUri: any): boolean => listUri === state.currentList?.uri,
    )
  if (cursor instanceof Error) {
    state.openErrorPopup(
      "errorApiFailed",
      "main-state/fetchListFeeds"
    )
    return false
  }
  if (cursor != null) {
    state.currentListFeedsCursor = cursor
  }
  return true
}

// ポップオーバー

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

// ポップオーバー - リポストポップオーバー

function openRepostPopover (selector: string | HTMLElement) {
  state.repostPopoverSelector = selector
  state.repostPopoverProps.display = true
}

function closeRepostPopover () {
  state.repostPopoverProps.display = false
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

// ポップオーバー - マイフィードソートポップオーバー

function openMyFeedsSortPopover (selector: string | HTMLElement) {
  state.myFeedsSortPopoverSelector = selector
  state.myFeedsSortPopoverProps.display = true
}

function closeMyFeedsSortPopover () {
  state.myFeedsSortPopoverProps.display = false
}

// ポップオーバー - キーワード履歴ポップオーバー

function openKeywordHistoryPopover (
  kind: "postSearchKeywordHistory",
  selector: string | HTMLElement,
  keywords: string[],
  callback?: Function
) {
  state.keywordHistoryPopoverProps.kind = kind
  state.keywordHistoryPopoverProps.selector = selector
  state.keywordHistoryPopoverProps.keywords = keywords
  state.keywordHistoryPopoverProps.callback = callback
  state.keywordHistoryPopoverProps.display = true
}

function closeKeywordHistoryPopover () {
  state.keywordHistoryPopoverProps.display = false
}

function addKeywordHistory (newword: string, keywords?: string[]) {
  if (keywords == null) return
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

async function openConfirmationPopup (title?: string, text?: string, detail?: string): Promise<boolean> {
  state.confirmationPopupTitle = title
  state.confirmationPopupText = text
  state.confirmationPopupDetail = detail
  state.confirmationPopupResult = false
  state.confirmationPopupDisplay = true
  await Util.waitProp(() => state.confirmationPopupDisplay, false)
  return state.confirmationPopupResult
}

function closeConfirmationPopup () {
  state.confirmationPopupResult = false
  state.confirmationPopupDisplay = false
}

function applyConfirmationPopup () {
  state.confirmationPopupResult = true
  state.confirmationPopupDisplay = false
}

// ポップアップ - アカウントポップアップ

function openAccountPopup () {
  state.accountPopupDisplay = true
}

function closeAccountPopup () {
  state.accountPopupDisplay = false
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

// ポップアップ - コンテンツフィルタリングポップアップ

function openContentFilteringPopup () {
  state.contentFilteringPopupDisplay = true
}

function closeContentFilteringPopup () {
  state.contentFilteringPopupDisplay = false
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

// ポップアップ - ポスト送信ポップアップ

let isSendPostDone = false

async function openSendPostPopup (params: TTSendPostPopupParams): Promise<boolean> {
  state.sendPostPopupProps.type = params.type
  state.sendPostPopupProps.post = params.post
  state.sendPostPopupProps.text = params.text
  state.sendPostPopupProps.url = params.url
  state.sendPostPopupProps.fileList = params.fileList
  state.sendPostPopupProps.createdAt = params.createdAt
  state.sendPostPopupProps.display = true
  state.sendPostPopupProps.visibility = true
  await Util.waitProp(() => state.sendPostPopupProps.visibility, false)
  return isSendPostDone
}

function closeSendPostPopup (done: boolean, hidden: boolean) {
  isSendPostDone = done
  if (!hidden) {
    state.sendPostPopupProps.display = false
    state.currentPostTags.splice(0)
    state.postDatePopupDate = undefined
  }
  state.sendPostPopupProps.visibility = false
}

// ポップアップ - マイタグポップアップ

function openMyTagPopup (props?: TTMyTagPopupProps) {
  state.myTagPopupProps.mode = props?.mode ?? "select"
  state.myTagPopupProps.display = true
}

function closeMyTagPopup () {
  state.myTagPopupProps.display = false
}

// ポップアップ - ポスト日時選択ポップアップ

function openPostDatePopup () {
  state.postDatePopupDisplay = true
}

function closePostDatePopup () {
  state.postDatePopupDisplay = false
}

// ポップアップ - Threadgate ポップアップ

function openThreadgatePopup (props: TTThreadgatePopupProps) {
  state.threadgatePopupProps.mode = props.mode
  state.threadgatePopupProps.draftThreadgate = props.draftThreadgate
  state.threadgatePopupProps.postThreadgate = props.postThreadgate
  state.threadgatePopupProps.postUri = props.postUri
  state.threadgatePopupProps.onClosed = props.onClosed
  state.threadgatePopupProps.display = true
}

function closeThreadgatePopup (params: any) {
  if (state.threadgatePopupProps.onClosed != null)
    state.threadgatePopupProps.onClosed(params)
  state.threadgatePopupProps.display = false
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
