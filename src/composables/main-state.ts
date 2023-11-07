import endOfYesterday from "date-fns/endOfYesterday"
import format from "date-fns/format"
import intlFormatDistance from "date-fns/intlFormatDistance"
import isSameYear from "date-fns/isSameYear"
import { computed, reactive } from "vue"
import type { LocationQueryValue } from "vue-router"
import AtpWrapper from "@/composables/atp-wrapper"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"
import LABEL_BEHAVIORS from "@/consts/label_behaviors.json"
import LANGUAGES from "@/consts/languages.json"

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
  sendFeedReportPopupProps: {
    display: false,
    generator: undefined,
  },
  sendPostPopupProps: {
    display: false,
    type: "post",
    post: undefined,
    fileList: undefined,
    createdAt: undefined,
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
  fetchCurrentAuthorCustomFeeds,
  fetchAuthorReposts,
  fetchAuthorLikes,
  filterLabels,
  getContentWarningVisibility,

  fetchPreferences,
  getConcernedPreferences,
  feedPreferences: computed((): undefined | TTPreference => {
    return state.currentPreferences.find((preference: TTPreference) => {
      return preference.$type === "app.bsky.actor.defs#savedFeedsPref"
    })
  }),
  fetchMyFeedGenerators,
  sortMyFeedGenerators,
  sortFeedPreferencesSavedAndPinned,
  fetchMyFeeds,

  fetchTimeline,
  fetchPostThread,
  fetchNotifications,
  fetchFollowers,
  fetchFollowings,
  fetchSuggestedFollows,
  fetchSuggestions,

  fetchPopularFeedGenerators,
  fetchSearchFeeds,
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

  // タイムフィードポップアップの開閉
  openTimeFeedsPopup,
  closeTimeFeedsPopup,

  // 通知ポップアップの開閉
  openNotificationPopup,
  closeNotificationPopup,

  // 設定ポップアップの開閉
  openSettingsPopup,
  closeSettingsPopup,

  // アカウントポップアップの開閉
  openAccountPopup,
  closeAccountPopup,

  // コンテンツ言語ポップアップの開閉
  openContentLanguagesPopup,
  closeContentLanguagesPopup,

  // ポスト言語ポップアップの開閉
  openPostLanguagesPopup,
  closePostLanguagesPopup,

  // ラベル選択ポップアップの開閉
  openSelectLabelsPopup,
  closeSelectLabelsPopup,

  // ポスト日時選択ポップアップの開閉
  openPostDatePopup,
  closePostDatePopup,

  // 招待コード確認ポップアップの開閉
  openInviteCodesPopup,
  closeInviteCodesPopup,

  // マイフィードポップアップの開閉
  openMyFeedsPopup,
  closeMyFeedsPopup,

  // タグ
  currentPostTags: [],
  myTagPopupProps: {
    display: false,
    mode: "select",
  },
  openMyTagPopup,
  closeMyTagPopup,

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

  // フィードレポート送信ポップアップの開閉
  openSendFeedReportPopup,
  closeSendFeedReportPopup,

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

  // 現在のセッションにアバター画像を設定
  if (state.atp.session != null && state.userProfile?.avatar != null)
    state.atp.session.__avatar = state.userProfile?.avatar
}

async function fetchCurrentProfile (did: string) {
  state.currentProfile = null
  state.currentAuthorReposts.splice(0)
  state.currentAuthorLikes.splice(0)
  state.currentAuthorCustomFeeds.splice(0)
  state.currentFollowers.splice(0)
  state.currentFollowings.splice(0)
  state.currentSuggestedFollows.splice(0)
  state.currentProfile = await state.atp.fetchProfile(did)
  if (state.currentProfile == null) return
  if (did === state.atp.session?.did)
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
  let log = await fetch(`https://plc.directory/${state.currentProfile.did}/log/audit`)
  let logJson = await log.json()
  console.log("[klearsky/log/audit]", logJson)
  if (state.currentProfile == null) return // await　中に初期化される恐れがあるため

  // Sandbox PDS対応
  if (!Array.isArray(logJson)) {
    log = await fetch(`https://plc.bsky-sandbox.dev/${state.currentProfile.did}/log/audit`)
    logJson = await log.json()
    console.log("[klearsky/log/audit]", logJson)
    if (state.currentProfile == null) return // await　中に初期化される恐れがあるため
    if (!Array.isArray(logJson)) return
  }

  state.currentProfile.__createdAt = logJson[0]?.createdAt
  state.currentProfile.__log = logJson.reverse()
}

async function fetchCurrentAuthorFeed (direction: "new" | "old", filter?: string, middleCursor?: string) {
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
      direction === "old" ? middleCursor ?? cursor : undefined,
      filter ?? "posts_no_replies",
      middleCursor != null
    )
  if (resultCursor != null)
    filter === "posts_with_replies"
      ? state.currentAuthorFeedsWithRepliesCursor = resultCursor
      : filter === "posts_with_media" 
        ? state.currentAuthorFeedsWithMediaCursor = resultCursor
        : state.currentAuthorFeedsCursor = resultCursor
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

async function fetchAuthorReposts (direction: "new" | "old") {
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

async function fetchAuthorLikes (direction: "new" | "old") {
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

async function fetchPreferences (): Promise<boolean> {
  const preferences = await state.atp.fetchPreferences()
  if (preferences == null) return false
  state.currentPreferences.splice(0, state.currentPreferences.length, ...preferences)
  return true
}

// ラベル対応

function filterLabels (
  visibilities?: Array<TTContentVisibility>,
  warns?: Array<TTLabelOnWarn>,
  labels?: Array<TTLabel>
): Array<TTLabel> {
  const results = labels?.filter((label: TTLabel) => {
    const labelBehavior = LABEL_BEHAVIORS[label.val]

    // configurable ではないビルトインラベルの処理
    if (labelBehavior?.configurable === false &&
      (
        warns == null ||
        warns.indexOf("alert") === - 1
      )
    ) {
      const specifiedHide = visibilities?.indexOf("hide") !== - 1
      if (label.val === "!hide" && specifiedHide) return true

      const specifiedWarn = visibilities?.indexOf("warn") !== - 1
      if (label.val === "!warn" && specifiedWarn) return true

      if (labelBehavior?.group === "legal" &&
        (specifiedHide || specifiedWarn)
      ) return true
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
  return {
    $type: "app.bsky.actor.defs#contentLabelPref",
    label,
    visibility: label === "!hide"
      ? "hide"
      : LABEL_BEHAVIORS[label]?.configurable === false
        ? "warn"
        : "show",
  }
}

async function fetchTimeline (direction: "old" | "new", middleCursor?: string) {
  const cursor: undefined | false | string =
    await state.atp.fetchTimeline(
      state.timelineFeeds,
      state.currentSetting.replyControl,
      state.currentSetting.repostControl,
      CONSTS.LIMIT_OF_FETCH_FEEDS,
      direction === "old" ? middleCursor ?? state.timelineCursor : undefined,
      middleCursor != null
    )
  if (cursor === false) state.openErrorPopup("errorApiFailed", "main-state/fetchTimeline")
  else if (cursor != null) state.timelineCursor = cursor
}

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

  // ブロックしている
  if (state.currentProfile?.viewer.blocking != null) return

  // ブロックされている
  if (state.currentProfile?.viewer.blockedBy) return

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

async function fetchSearchFeeds (direction: "old" | "new") {
  const cursor: Error | undefined | string =
    await state.atp.fetchPopularFeedGenerators(
      state.currentSearchFeeds,
      CONSTS.LIMIT_OF_FETCH_POPULAR_FEED_GENERATORS,
      direction === "old" ? state.currentSearchFeedsCursor : undefined,
      state.currentSearchFeedsTerm
    )
  if (cursor instanceof Error) state.openErrorPopup(
    "errorApiFailed",
    "main-state/fetchSearchFeeds"
  )
  else if (cursor != null) state.currentSearchFeedsCursor = cursor
}

async function fetchCustomFeeds (direction: "old" | "new", middleCursor?: string) {
  if (state.currentCustomUri !== state.currentQuery.feed) {
    state.currentCustomFeeds.splice(0)
    state.currentCustomCursor = undefined
  }
  const cursor: undefined | false | string =
    await state.atp.fetchCustomFeeds(
      state.currentCustomFeeds,
      state.currentQuery.feed,
      CONSTS.LIMIT_OF_FETCH_FEEDS,
      direction === "old" ? middleCursor ?? state.currentCustomCursor : undefined,
      middleCursor != null
    )
  if (cursor === false) state.openErrorPopup("errorApiFailed", "main-state/fetchCustomFeeds")
  else if (cursor != null) state.currentCustomCursor = cursor
  state.currentCustomUri = state.currentQuery.feed
}

async function fetchMyFeedGenerators (): Promise<void> {
  const generators = await state.atp.fetchFeedGenerators(state.feedPreferences.saved)
  if (generators instanceof Error) {
    state.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchFeedGenerators")
    return
  }
  state.currentMyFeedGenerators.splice(0, state.currentMyFeedGenerators.length, ...generators)
}

function sortMyFeedGenerators () {
  if (state.feedPreferences?.pinned == null) return
  state.currentMyFeedGenerators.sort((a: TTFeedGenerator, b: TTFeedGenerator) => {
    const aIsPinned = state.feedPreferences.pinned.indexOf(a.uri)
    const bIsPinned = state.feedPreferences.pinned.indexOf(b.uri)
    return (aIsPinned !== - 1 && bIsPinned !== - 1) || (aIsPinned === - 1 && bIsPinned === - 1)
      ? 0
      : aIsPinned === - 1 && bIsPinned !== - 1
        ? 1
        : aIsPinned !== - 1 && bIsPinned === - 1
          ? - 1
          : 0
  })
}

function sortFeedPreferencesSavedAndPinned () {
  if (state.feedPreferences?.saved != null)
    state.feedPreferences.saved = state.currentMyFeedGenerators
      .map((generator: TTFeedGenerator) => generator.uri)
  if (state.feedPreferences?.pinned != null)
    state.feedPreferences.pinned = state.currentMyFeedGenerators
      .filter((generator: TTFeedGenerator) => state.feedPreferences.pinned.includes(generator.uri))
      .map((generator: TTFeedGenerator) => generator.uri)
}

async function fetchMyFeeds (): Promise<boolean> {
  const pinned: undefined | Array<string> =
    state.feedPreferences?.saved.filter((uri: string) => state.feedPreferences?.pinned.includes(uri))
  if (pinned == null) return false

  const generators = await state.atp.fetchFeedGenerators(pinned)
  if (generators instanceof Error) {
    state.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchFeedGenerators")
    return false
  }

  for (const uri in state.currentMyFeeds) {
    delete state.currentMyFeeds[uri]
  }

  pinned.forEach((uri: string) => {
    if (state.currentMyFeeds[uri] != null) return
    const generator = generators.find((generator: TTFeedGenerator) => generator.uri === uri)
    if (generator == null) return
    state.currentMyFeeds[uri] = { generator, feeds: [], processing: false, status: true }
  })

  // あえて並列同期していない
  pinned.forEach(async (uri: string) => {
    if (state.currentMyFeeds[uri] == null) return
    state.currentMyFeeds[uri].processing = true
    const status = await state.atp.fetchCustomFeeds(state.currentMyFeeds[uri].feeds, uri, CONSTS.LIMIT_OF_FETCH_MY_FEEDS)
    state.currentMyFeeds[uri].status = status !== false
    state.currentMyFeeds[uri].processing = false
  })

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
    state.settings[did].contentLanguages = []
  else state.settings[did].contentLanguages = getSanitizedLanguages(state.settings[did].contentLanguages)
  if (state.settings[did].fontSize == null)
    state.settings[did].fontSize = "medium"
  if (state.settings[did].tags == null)
    state.settings[did].tags = []
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
    state.settings[did].imageAspectRatio = "3 / 2"
  if (state.settings[did].imageOption == null)
    state.settings[did].imageOption = []
  if (state.settings[did].linkcardEmbeddedControl == null)
    state.settings[did].linkcardEmbeddedControl = [
      "giphy",
      "graysky",
      "spotify",
      "twitter",
      "youtube",
      "nicovideo",
    ]
  if (state.settings[did].globallineLayout == null)
    state.settings[did].globallineLayout = "post"
  if (state.settings[did].layout == null)
    state.settings[did].layout = "default"
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
  if (state.settings[did].postLanguages == null)
    state.settings[did].postLanguages = [Util.getUserLanguage()]
  else state.settings[did].postLanguages = getSanitizedLanguages(state.settings[did].postLanguages)
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
  if (state.currentSetting?.uiLanguage == null) return

  // NOTICE: UI言語の変更を即時反映するために `forceUpdate()` を呼び出すと、
  //         すべてのコンポーネントが更新されてしまう。この現象の防止策として、
  //         UI言語の変更以外では `forceUpdate()` を呼び出さないようにしている
  const oldUiLanguage = state.$getI18n != null ? state.$getI18n() : undefined
  if (state.$setI18n != null) state.$setI18n(state.currentSetting.uiLanguage)
  if (oldUiLanguage !== state.currentSetting.uiLanguage) state.forceUpdate()
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

async function openSendPostPopup (params: TTSendPostPopupParams): Promise<boolean> {
  state.sendPostPopupProps.display = true
  state.sendPostPopupProps.type = params.type
  state.sendPostPopupProps.post = params.post
  state.sendPostPopupProps.text = params.text
  state.sendPostPopupProps.url = params.url
  state.sendPostPopupProps.fileList = params.fileList
  state.sendPostPopupProps.createdAt = params.createdAt
  state.currentPostTags.splice(0)
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

function openMessagePopup ({ title, text, hasTranslateLink }: Omit<TTMessagePopupProps, "display">) {
  state.messagePopupProps.title = title
  state.messagePopupProps.text = text
  state.messagePopupProps.hasTranslateLink = hasTranslateLink
  state.messagePopupProps.display = true
}

function closeMessagePopup () {
  state.messagePopupProps.display = false
}

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

// タイムフィードポップアップの開閉

function openTimeFeedsPopup (post: TTPost) {
  state.currentTimeFeeds.splice(0)
  state.currentTimeFeeds.push(post)
  state.timeFeedsPopupProps = post
  state.timeFeedsPopupDisplay = true
}

function closeTimeFeedsPopup () {
  state.timeFeedsPopupDisplay = false
}

// 通知ポップアップの開閉

function openNotificationPopup () {
  state.notificationPopupDisplay = true
}

function closeNotificationPopup () {
  state.notificationPopupDisplay = false
}

// 設定ポップアップの開閉

function openSettingsPopup () {
  state.settingsPopupDisplay = true
}

function closeSettingsPopup () {
  state.settingsPopupDisplay = false
}

// アカウントポップアップの開閉

function openAccountPopup () {
  state.accountPopupDisplay = true
}

function closeAccountPopup () {
  state.accountPopupDisplay = false
}

// コンテンツ言語ポップアップの開閉

function openContentLanguagesPopup () {
  state.contentLanguagesPopupDisplay = true
}

function closeContentLanguagesPopup () {
  state.contentLanguagesPopupDisplay = false
}

// ポスト言語ポップアップの開閉

function openPostLanguagesPopup () {
  state.postLanguagesPopupDisplay = true
}

function closePostLanguagesPopup () {
  state.postLanguagesPopupDisplay = false
}

// ラベル選択ポップアップの開閉

function openSelectLabelsPopup (type: "post" | "account", params: any) {
  state.selectLabelsPopupDisplay = true
  state.selectLabelsPopupState = params
}

function closeSelectLabelsPopup () {
  state.selectLabelsPopupDisplay = false
}

// ポスト日時選択ポップアップの開閉

function openPostDatePopup () {
  state.postDatePopupDisplay = true
}

function closePostDatePopup () {
  state.postDatePopupDisplay = false
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

// マイタグポップアップの開閉

function openMyTagPopup (props?: TTMyTagPopupProps) {
  state.myTagPopupProps.mode = props?.mode ?? "select"
  state.myTagPopupProps.display = true
}

function closeMyTagPopup () {
  state.myTagPopupProps.display = false
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

// フィードレポート送信ポップアップの開閉

function openSendFeedReportPopup (generator: TTFeedGenerator) {
  state.sendFeedReportPopupProps.generator = generator
  state.sendFeedReportPopupProps.display = true
}

function closeSendFeedReportPopup () {
  state.sendFeedReportPopupProps.display = false
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
