import endOfYesterday from "date-fns/endOfYesterday"
import format from "date-fns/format"
import intlFormatDistance from "date-fns/intlFormatDistance"
import isSameYear from "date-fns/isSameYear"
import { computed, reactive } from "vue"
import type {
  LocationQueryValue,
} from "vue-router"
import AtpWrapper from "@/composables/atp-wrapper"
import Util from "@/composables/util/index"
import consts from "@/consts/consts.json"

const state = reactive<MainState>({
  // @ts-ignore // TODO:
  atp: new AtpWrapper(),
  mounted: false,
  processing: false,
  loginPopupDisplay: false,
  loginPopupAutoDisplay: computed((): boolean => {
    return state.mounted && (!state.atp.hasLogin() || state.loginPopupDisplay)
  }),
  sendPostPopupProps: {
    display: false,
    type: "post",
    post: undefined,
  },
  imagePopupProps: {
    display: false,
    largeUri: "",
    smallUri: "",
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
  getConcernedPreferences,
  fetchHotFeeds,
  fetchTimeline,
  fetchPostThread,
  fetchNotifications,
  fetchFollowers,
  fetchFollowings,
  fetchSuggestions,
  saveSettings,
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
        locale: state.currentSetting.language,
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
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor: undefined | string =
    await state.atp.fetchAuthorFeed(
      state.currentAuthorFeeds as Array<TTFeed>,
      handle,
      consts.limitOfFetchAuthorFeeds,
      direction === "old" ? state.currentAuthorCursor : undefined
    )
  if (cursor != null) state.currentAuthorCursor = cursor
}

async function fetchAuthorReposts (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return
  const cursor: undefined | string = await state.atp.fetchAuthorReposts(
    state.currentAuthorReposts,
    handle,
    consts.limitOfFetchAuthorReposts,
    direction === "new" ? undefined : state.currentAuthorRepostsCursor
  )
  state.currentAuthorRepostsCursor = cursor
}

async function fetchAuthorLikes (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return
  const cursor: undefined | string = await state.atp.fetchAuthorLikes(
    state.currentAuthorLikes,
    handle,
    consts.limitOfFetchAuthorLikes,
    direction === "new" ? undefined : state.currentAuthorLikesCursor
  )
  state.currentAuthorLikesCursor = cursor
}

// ラベル対応

const labelMap: { [k: string]: Array<string> } = {
  defaults: ["porn"],
  gore: ["gore"],
  hate: ["hate"],
  impersonation: ["impersonation"],
  nsfw: ["nsfw", "porn"],
  nudity: ["nudity", "porn"],
  spam: ["spam"],
  suggestive: ["suggestive", "porn"],
}

function getContentWarningVisibility (
  authorLabels?: Array<TTLabel>,
  postLabels?: Array<TTLabel>,
  processAuthor = true,
  processPost = true,
): "hide" | "show" | "warn" {
  const authorPreferences = state.getConcernedPreferences(authorLabels)
  const postPreferences = state.getConcernedPreferences(postLabels)
  if (processAuthor && authorPreferences.some((preference: TTPreference) => {
    return preference.visibility === "hide"
  })) return "hide"
  if (processPost && postPreferences.some((preference: TTPreference) => {
    return preference.visibility === "hide"
  })) return "hide"
  if (processAuthor && authorPreferences.some((preference: TTPreference) => {
    return preference.visibility === "warn"
  })) return "warn"
  if (processPost && postPreferences.some((preference: TTPreference) => {
    return preference.visibility === "warn"
  })) return "warn"
  return "show"
}

function getConcernedPreferences (labels?: Array<TTLabel>): Array<TTPreference> {
  if (labels == null) return []
  return state.currentPreferences.filter((preference: TTPreference) => {
    if (preference.label == null ||
        preference.visibility === "show") return false
    const label = labels.find((label: TTLabel) => {
      return (labelMap[preference.label ?? "defaults"] ?? labelMap.defaults).includes(label.val)
    })
    if (label == null) return false
    return true
  })
}

async function fetchHotFeeds (direction: "old" | "new") {
  const cursor: undefined | string =
    await state.atp.fetchHotFeeds(
      state.currentHotFeeds,
      consts.limitOfFetchHotFeeds,
      direction === "old" ? state.currentHotCursor : undefined
    )
  if (cursor != null) state.currentHotCursor = cursor
}

async function fetchTimeline (direction: "old" | "new") {
  const cursor: undefined | string =
    await state.atp.fetchTimeline(
      state.timelineFeeds,
      state.currentSetting.replyControl,
      state.currentSetting.repostControl,
      consts.limitOfFetchTimeline,
      direction === "old" ? state.timelineCursor : undefined
    )
  if (cursor != null) state.timelineCursor = cursor
}

async function fetchPostThread () {
  const uri = state.currentQuery.postUri as LocationQueryValue
  if (!uri) return
  state.currentPosts = await state.atp.fetchPostThread(uri) ?? []
}

async function fetchNotifications (limit: number, direction: "new" | "old") {
  const result: null | {
    cursor?: string
    newNotificationCount: number
  } = await state.atp.fetchNotifications(
    state.notifications,
    limit,
    direction === "new" ? undefined : state.notificationCursor
  )
  if (result == null) return
  state.notificationCursor = result.cursor
}

async function fetchFollowers (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor: undefined | string = await state.atp.fetchFollowers(
    state.currentFollowers,
    handle,
    consts.limitOfFetchFollows,
    direction === "new" ? undefined : state.currentFollowersCursor
  )
  state.currentFollowersCursor = cursor
}

async function fetchFollowings (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

  const cursor: undefined | string = await state.atp.fetchFollowings(
    state.currentFollowings,
    handle,
    consts.limitOfFetchFollows,
    direction === "new" ? undefined : state.currentFollowingsCursor
  )
  state.currentFollowingsCursor = cursor
}

async function fetchSuggestions (direction: "new" | "old") {
  state.currentSearchSuggestionCursor =
    await state.atp.fetchSuggestions(
      state.currentSearchSuggestionResults,
      consts.limitOfFetchSuggestionSearch,
      direction === "new" ? undefined : state.currentSearchSuggestionCursor
    )
}

function saveSettings () {
  const did = state.atp.session?.did
  if (did == null) return
  if (state.settings[did] == null)
    state.settings[did] = {}
  if (state.settings[did].language == null)
    state.settings[did].language = state.$getI18n != null
      ? state.$getI18n()
      : window.navigator.language
  if (state.settings[did].autoTranslation == null)
    state.settings[did].autoTranslation = false
  if (state.settings[did].autoTranslationIgnoreLanguage == null)
    state.settings[did].autoTranslationIgnoreLanguage = undefined
  if (state.settings[did].fontSize == null)
    state.settings[did].fontSize = "medium"
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
    state.settings[did].globallineLanguage = window.navigator.language ?? "en"
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

function updateSettings () {
  updateI18nSetting()
  updateFontSizeSetting()
  updateColorThemeSetting()
}

function updateI18nSetting () {
  if (state.currentSetting?.language != null) {
    if (state.$setI18n != null) state.$setI18n(state.currentSetting.language)
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

async function openSendPostPopup (type: TTPostType, post?: TTPost, text?: string): Promise<boolean> {
  state.sendPostPopupProps.display = true
  state.sendPostPopupProps.type = type
  state.sendPostPopupProps.post = post
  state.sendPostPopupProps.text = text
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

export default state
