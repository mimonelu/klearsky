import endOfYesterday from "date-fns/endOfYesterday"
import format from "date-fns/format"
import intlFormatDistance from "date-fns/intlFormatDistance"
import isSameYear from "date-fns/isSameYear"
import { computed, reactive } from "vue"
import type { LocationQueryValue } from "vue-router"
import AtpWrapper from "@/composables/atp-wrapper"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"
import LABELS from "@/consts/labels.json"

const state = reactive<MainState>({
  // @ts-ignore // TODO:
  atp: new AtpWrapper(),
  mounted: false,
  processing: false,
  loginPopupDisplay: false,
  loginPopupAutoDisplay: computed((): boolean => {
    return state.mounted && (!state.atp.hasLogin() || state.loginPopupDisplay)
  }),
  sendAccountReportPopupProps: {
    display: false,
    user: undefined,
  },
  sendPostReportPopupProps: {
    display: false,
    post: undefined,
  },
  sendPostPopupProps: {
    display: false,
    type: "post",
    post: undefined,
    fileList: undefined,
  },
  imagePopupProps: {
    display: false,
    images: [],
    index: 0,
  },
  errorPopupProps: {
    display: false,
    error: undefined,
    description: undefined,
  },
  settings: {},
  backgroundImage: computed((): string => {
    if (state.currentSetting?.backgroundImage == null) return ""
    const backgroundImage: string = state.currentSetting.backgroundImage
      .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;")
    return backgroundImage.match(/^\/|^\w+:\/+/)
      ? `url(${backgroundImage})`
      : backgroundImage
  }),
  $setI18n: undefined,
  $getI18n: undefined,

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

  formatDate,
  forceUpdate,
  fetchUserProfile,
  fetchCurrentProfile,
  fetchCurrentAuthorFeed,
  fetchAuthorReposts,
  fetchAuthorLikes,
  getContentWarningVisibility,

  fetchPreferences,
  getConcernedPreferences,
  feedPreferences: computed((): undefined | TTPreference => {
    return state.currentPreferences.find((preference: TTPreference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
    })
  }),
  fetchMyFeeds,

  fetchTimeline,
  fetchPostThread,
  fetchNotifications,
  fetchFollowers,
  fetchFollowings,
  fetchSuggestions,

  fetchPopularFeedGenerators,
  fetchCustomFeeds,

  saveSettings,
  resetSettings,
  updateSettings,
  updateI18nSetting,
  updateColorThemeSetting,

  updateUserProfile,
  openSendPostPopup,
  closeSendPostPopup,
  openRepostUsersPopup,
  closeRepostUsersPopup,
  openLikeUsersPopup,
  closeLikeUsersPopup,
  openMessagePopup,
  closeMessagePopup,
  openConfirmationPopup,
  closeConfirmationPopup,
  applyConfirmationPopup,

  // コンテンツ言語ポップアップの開閉
  openContentLanguagesPopup,
  closeContentLanguagesPopup,

  // 招待コード確認ポップアップの開閉
  openInviteCodesPopup,
  closeInviteCodesPopup,

  // マイフィードポップアップの開閉
  openMyFeedsPopup,
  closeMyFeedsPopup,

  // ワードミュートポップアップの開閉
  openWordMutePopup,
  closeWordMutePopup,

  // コンテンツフィルタリングポップアップの開閉
  openContentFilteringPopup,
  closeContentFilteringPopup,

  // ミュートユーザーリストポップアップの開閉
  openMutingUsersPopup,
  closeMutingUsersPopup,

  // ブロックユーザーリストポップアップの開閉
  openBlockingUsersPopup,
  closeBlockingUsersPopup,

  // アカウントレポート送信ポップアップの開閉
  openSendAccountReportPopup,
  closeSendAccountReportPopup,

  // ポストレポート送信ポップアップの開閉
  openSendPostReportPopup,
  closeSendPostReportPopup,

  // エラーポップアップの開閉
  openErrorPopup,
  closeErrorPopup,
})

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

function forceUpdate () {
  state.updateKey = new Date().getTime()
}

async function fetchUserProfile () {
  state.userProfile = await state.atp.fetchProfile(state.atp.session?.handle as string)
}

async function fetchCurrentProfile (handle: string) {
  state.currentProfile = null
  state.currentAuthorReposts.splice(0)
  state.currentAuthorLikes.splice(0)
  state.currentFollowers.splice(0)
  state.currentFollowings.splice(0)
  state.currentProfile = await state.atp.fetchProfile(handle)
  if (state.currentProfile == null) return
  if (handle === state.atp.session?.handle)
    state.userProfile = state.currentProfile

  // ハンドル履歴と利用開始日の取得（非同期で良い）
  fetchLogAudit()
}

async function updateUserProfile (profile: TTUpdateProfileParams) {
  state.processing = true
  try {
    await state.atp.updateProfile(profile)
  } finally {
    state.processing = false
  }
}

async function fetchLogAudit () {
  if (state.currentProfile == null) return
  const log = await fetch(`https://plc.directory/${state.currentProfile.did}/log/audit`)
  const logJson = await log.json()
  if (state.currentProfile == null) return // await　中に初期化される恐れがあるため
  state.currentProfile.__createdAt = logJson[0]?.createdAt
  state.currentProfile.__log = logJson.reverse()
  console.log("[klearsky/log/audit]", logJson)
}

async function fetchCurrentAuthorFeed (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor: undefined | string =
    await state.atp.fetchAuthorFeed(
      state.currentAuthorFeeds as Array<TTFeed>,
      account,
      CONSTS.limitOfFetchAuthorFeeds,
      direction === "old" ? state.currentAuthorCursor : undefined
    )
  if (cursor != null) state.currentAuthorCursor = cursor
}

async function fetchAuthorReposts (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return
  const cursor: undefined | string = await state.atp.fetchAuthorReposts(
    state.currentAuthorReposts,
    account,
    CONSTS.limitOfFetchAuthorReposts,
    direction === "new" ? undefined : state.currentAuthorRepostsCursor
  )
  state.currentAuthorRepostsCursor = cursor
}

async function fetchAuthorLikes (direction: "new" | "old") {
  const account = state.currentQuery.account as LocationQueryValue
  if (!account) return
  const cursor: undefined | string = await state.atp.fetchAuthorLikes(
    state.currentAuthorLikes,
    account,
    CONSTS.limitOfFetchAuthorLikes,
    direction === "new" ? undefined : state.currentAuthorLikesCursor
  )
  state.currentAuthorLikesCursor = cursor
}

async function fetchPreferences (): Promise<boolean> {
  const preferences = await state.atp.fetchPreferences()
  if (preferences == null) return false
  state.currentPreferences.splice(0, state.currentPreferences.length, ...preferences)
  return true
}

// ラベル対応

function getContentWarningVisibility (
  authorLabels?: Array<TTLabel>,
  postLabels?: Array<TTLabel>,
): TTContentVisibility {
  const authorPreferences = state.getConcernedPreferences(authorLabels)
  const postPreferences = state.getConcernedPreferences(postLabels)
  for (const preference of authorPreferences) {
    if (preference.visibility === "always-hide") return "always-hide"
  }
  for (const preference of postPreferences) {
    if (preference.visibility === "always-hide") return "always-hide"
  }
  for (const preference of authorPreferences) {
    if (preference.visibility === "hide") return "hide"
  }
  for (const preference of postPreferences) {
    if (preference.visibility === "hide") return "hide"
  }
  for (const preference of authorPreferences) {
    if (preference.visibility === "always-warn") return "always-warn"
  }
  for (const preference of postPreferences) {
    if (preference.visibility === "always-warn") return "always-warn"
  }
  for (const preference of authorPreferences) {
    if (preference.visibility === "warn") return "warn"
  }
  for (const preference of postPreferences) {
    if (preference.visibility === "warn") return "warn"
  }
  return "show"
}

// label に該当する preference を取得する
function getConcernedPreferences (labels?: Array<TTLabel>): Array<TTPreference> {
  if (labels == null) return []

  const concernedPreferences = state.currentPreferences.filter((preference: TTPreference) => {
    if (preference.$type !== "app.bsky.actor.defs#contentLabelPref" ||
        preference.label == null ||
        preference.visibility === "show") return false
    const labelGroup = (LABELS.DEFAULTS as any)[preference.label as string]
    if (labelGroup == null) return false
    return labels.some((label: TTLabel) => {
      return labelGroup.includes(label.val)
    })
  })

  if (labels.some((label: TTLabel) => {
    return LABELS.ALWAYS_HIDE.includes(label.val)
  })) {
    concernedPreferences.push({
      $type: "app.bsky.actor.defs#contentLabelPref",
      label: "always-hide",
      visibility: "always-hide",
    })
  }

  if (labels.some((label: TTLabel) => {
    return LABELS.ALWAYS_WARN.includes(label.val)
  })) {
    concernedPreferences.push({
      $type: "app.bsky.actor.defs#contentLabelPref",
      label: "always-warn",
      visibility: "always-warn",
    })
  }

  return concernedPreferences
}

async function fetchTimeline (direction: "old" | "new") {
  const cursor: undefined | false | string =
    await state.atp.fetchTimeline(
      state.timelineFeeds,
      state.currentSetting.replyControl,
      state.currentSetting.repostControl,
      CONSTS.limitOfFetchFeeds,
      direction === "old" ? state.timelineCursor : undefined
    )
  if (cursor === false) state.openErrorPopup("errorApiFailed", "main-state/fetchTimeline")
  else if (cursor != null) state.timelineCursor = cursor
}

async function fetchPostThread () {
  const uri = state.currentQuery.postUri as LocationQueryValue
  if (!uri) return
  const posts = await state.atp.fetchPostThread(uri, CONSTS.limitOfFetchPostThread) ?? []
  if (posts) state.currentPosts = posts
}

async function fetchNotifications (limit: number, direction: "new" | "old") {
  const result: undefined | false | {
    cursor?: string
    newNotificationCount: number
  } = await state.atp.fetchNotifications(
    state.notifications,
    limit,
    direction === "new" ? undefined : state.notificationCursor
  )
  if (result === false) state.openErrorPopup("errorApiFailed", "main-state/fetchNotifications")
  else if (result != null) state.notificationCursor = result.cursor
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
    CONSTS.limitOfFetchFollows,
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
    CONSTS.limitOfFetchFollows,
    direction === "new" ? undefined : state.currentFollowingsCursor
  )
  state.currentFollowingsCursor = cursor
}

async function fetchSuggestions (direction: "new" | "old") {
  state.currentSearchSuggestionCursor =
    await state.atp.fetchSuggestions(
      state.currentSearchSuggestionResults,
      CONSTS.limitOfFetchSuggestionSearch,
      direction === "new" ? undefined : state.currentSearchSuggestionCursor
    )
}

async function fetchPopularFeedGenerators () {
  state.listProcessing = true
  const feeds = await state.atp.fetchPopularFeedGenerators()
  state.listProcessing = false
  if (feeds == null) return
  if (feeds === false) state.openErrorPopup("errorApiFailed", "main-state/fetchPopularFeedGenerators")
  state.currentPopularFeedGenerators = feeds as Array<TTFeedGenerator>
}

async function fetchCustomFeeds (direction: "old" | "new") {
  if (state.currentCustomUri !== state.currentQuery.feed) {
    state.currentCustomFeeds.splice(0)
    state.currentCustomCursor = undefined
  }
  const cursor: undefined | false | string =
    await state.atp.fetchCustomFeeds(
      state.currentCustomFeeds,
      state.currentQuery.feed,
      CONSTS.limitOfFetchFeeds,
      direction === "old" ? state.currentCustomCursor : undefined
    )
  if (cursor === false) state.openErrorPopup("errorApiFailed", "main-state/fetchCustomFeeds")
  else if (cursor != null) state.currentCustomCursor = cursor
  state.currentCustomUri = state.currentQuery.feed
}

async function fetchMyFeeds (): Promise<boolean> {
  const saved: undefined | Array<string> = state.feedPreferences?.saved
  if (saved == null) return false

  const generators = await state.atp.fetchFeedGenerators(saved)
  if (generators instanceof Error) {
    state.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchFeedGenerators")
    return false
  }

  for (const uri in state.currentMyFeeds) {
    delete state.currentMyFeeds[uri]
  }

  saved.forEach((uri: string) => {
    if (state.currentMyFeeds[uri] == null)
      state.currentMyFeeds[uri] = {
        generator: generators.find((generator: TTFeedGenerator) => generator.uri === uri),
        feeds: [],
      }
  })

  await Promise.allSettled(saved.map((uri: string) => {
    return state.atp.fetchCustomFeeds(state.currentMyFeeds[uri].feeds, uri, CONSTS.limitOfFetchMyFeeds)
  }))

  return true
}

function saveSettings () {
  const did = state.atp.session?.did
  if (did == null) return
  if (state.settings[did] == null)
    state.settings[did] = {}
  if (state.settings[did].uiLanguage == null)
    state.settings[did].uiLanguage = state.$getI18n != null
      ? state.$getI18n()
      : window.navigator.language
  if (state.settings[did].autoTranslation == null)
    state.settings[did].autoTranslation = false
  if (state.settings[did].autoTranslationIgnoreLanguage == null)
    state.settings[did].autoTranslationIgnoreLanguage = undefined
  if (state.settings[did].contentLanguages == null)
    state.settings[did].contentLanguages = [Util.getUserLanguage()]
  if (state.settings[did].fontSize == null)
    state.settings[did].fontSize = "medium"
  if (state.settings[did].wordMute == null)
    state.settings[did].wordMute = []
  if (state.settings[did].replyControl == null)
    state.settings[did].replyControl = []
  if (state.settings[did].repostControl == null)
    state.settings[did].repostControl = []
  if (state.settings[did].timeControl == null)
    state.settings[did].timeControl = "relative"
  if (state.settings[did].imageControl == null)
    state.settings[did].imageControl = "all"
  if (state.settings[did].imageAspectRatio == null)
    state.settings[did].imageAspectRatio = "1 / 1"
  if (state.settings[did].globallineLayout == null)
    state.settings[did].globallineLayout = "post"
  if (state.settings[did].globallineLanguage == null)
    state.settings[did].globallineLanguage = Util.getUserLanguage()
  if (state.settings[did].layout == null)
    state.settings[did].layout = "default"
  if (state.settings[did].borderRadius == null)
    state.settings[did].borderRadius = "0.5em"
  if (state.settings[did].colorTheme == null)
    state.settings[did].colorTheme = "auto"
  if (state.settings[did].mainAreaOpacity == null)
    state.settings[did].mainAreaOpacity = 1.0
  if (state.settings[did].backgroundImage == null)
    state.settings[did].backgroundImage = undefined
  if (state.settings[did].backgroundOpacity == null)
    state.settings[did].backgroundOpacity = 0.5
  if (state.settings[did].hideNumberOfReaction == null)
    state.settings[did].hideNumberOfReaction = false
  if (state.settings[did].postAnonymization == null)
    state.settings[did].postAnonymization = false
  if (state.settings[did].lightning == null)
    state.settings[did].lightning = undefined
  state.currentSetting = state.settings[did]
  Util.saveStorage("settings", state.settings)
}

function resetSettings () {
  const did = state.atp.session?.did
  if (did == null) return
  Object.keys(state.settings[did]).forEach((key: string) => {
    delete state.settings[did][key]
  })
  Util.saveStorage("settings", state.settings)
}

function updateSettings () {
  updateI18nSetting()
  updateFontSizeSetting()
  updateColorThemeSetting()
}

function updateI18nSetting () {
  if (state.currentSetting?.uiLanguage != null) {
    if (state.$setI18n != null) state.$setI18n(state.currentSetting.uiLanguage)
    state.forceUpdate()
  }
}

function updateFontSizeSetting () {
  window.document.documentElement.setAttribute(
    "data-font-size",
    state.currentSetting?.fontSize ?? "medium"
  )
}

function updateColorThemeSetting () {
  if (state.currentSetting?.colorTheme != null) {
    window.document.body.setAttribute(
      "data-color-theme",
      state.currentSetting.colorTheme as string
    )
  }
}

let isSendPostDone = false

async function openSendPostPopup (type: TTPostType, post?: TTPost, text?: string, fileList?: FileList): Promise<boolean> {
  state.sendPostPopupProps.display = true
  state.sendPostPopupProps.type = type
  state.sendPostPopupProps.post = post
  state.sendPostPopupProps.text = text
  state.sendPostPopupProps.fileList = fileList
  await Util.waitProp(() => state.sendPostPopupProps.display, false)
  return isSendPostDone
}

function closeSendPostPopup (done: boolean) {
  isSendPostDone = done
  state.sendPostPopupProps.display = false
}

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

function openMessagePopup (title?: string, text?: string) {
  state.messagePopupTitle = title
  state.messagePopupText = text
  state.messagePopupDisplay = true
}

function closeMessagePopup () {
  state.messagePopupDisplay = false
}

async function openConfirmationPopup (title?: string, text?: string): Promise<boolean> {
  state.confirmationPopupTitle = title
  state.confirmationPopupText = text
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

// コンテンツ言語ポップアップの開閉

function openContentLanguagesPopup () {
  state.contentLanguagesPopupDisplay = true
}

function closeContentLanguagesPopup () {
  state.contentLanguagesPopupDisplay = false
}

// 招待コード確認ポップアップの開閉

function openInviteCodesPopup () {
  state.inviteCodesPopupDisplay = true
}

function closeInviteCodesPopup () {
  state.inviteCodesPopupDisplay = false
}

// マイフィードポップアップの開閉

function openMyFeedsPopup () {
  state.myFeedsPopupDisplay = true
}

function closeMyFeedsPopup () {
  state.myFeedsPopupDisplay = false
}

// ワードミュートポップアップの開閉

function openWordMutePopup () {
  state.wordMutePopupDisplay = true
}

function closeWordMutePopup () {
  state.wordMutePopupDisplay = false
}

// コンテンツフィルタリングポップアップの開閉

function openContentFilteringPopup () {
  state.contentFilteringPopupDisplay = true
}

function closeContentFilteringPopup () {
  state.contentFilteringPopupDisplay = false
}

// ミュートユーザーリストポップアップの開閉

function openMutingUsersPopup () {
  state.mutingUsersPopupDisplay = true
}

function closeMutingUsersPopup () {
  state.mutingUsersPopupDisplay = false
}

// ブロックユーザーリストポップアップの開閉

function openBlockingUsersPopup () {
  state.blockingUsersPopupDisplay = true
}

function closeBlockingUsersPopup () {
  state.blockingUsersPopupDisplay = false
}

// アカウントレポート送信ポップアップの開閉

function openSendAccountReportPopup (user: TTUser) {
  state.sendAccountReportPopupProps.user = user
  state.sendAccountReportPopupProps.display = true
}

function closeSendAccountReportPopup () {
  state.sendAccountReportPopupProps.display = false
}

// ポストレポート送信ポップアップの開閉

function openSendPostReportPopup (post: TTPost) {
  state.sendPostReportPopupProps.post = post
  state.sendPostReportPopupProps.display = true
}

function closeSendPostReportPopup () {
  state.sendPostReportPopupProps.display = false
}

// エラーポップアップの開閉

function openErrorPopup (error: any, description: any) {
  state.errorPopupProps.error = error
  state.errorPopupProps.description = description
  state.errorPopupProps.display = true
}

function closeErrorPopup () {
  state.errorPopupProps.display = false
}

export default state
