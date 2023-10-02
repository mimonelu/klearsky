<script setup lang="ts">
import { inject, nextTick, onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, provide } from "vue"
import type { LocationQueryValue, RouteLocationNormalized } from "vue-router"
import { useRouter } from "vue-router"
import { useEventListener } from "@vueuse/core"
import hotkeys from "hotkeys-js"
import AccountPopup from "@/components/popups/AccountPopup.vue"
import BlockingUsersPopup from "@/components/popups/BlockingUsersPopup.vue"
import ConfirmationPopup from "@/components/popups/ConfirmationPopup.vue"
import ContentFilteringPopup from "@/components/popups/ContentFilteringPopup.vue"
import ErrorPopup from "@/components/popups/ErrorPopup.vue"
import ImagePopup from "@/components/popups/ImagePopup.vue"
import InviteCodesPopup from "@/components/popups/InviteCodesPopup.vue"
import LikeUsersPopup from "@/components/popups/LikeUsersPopup.vue"
import Loader from "@/components/common/Loader.vue"
import LoginPopup from "@/components/popups/LoginPopup.vue"
import MainMenuHorizontal from "@/components/shell-parts/MainMenuHorizontal.vue"
import MainMenuVertical from "@/components/shell-parts/MainMenuVertical.vue"
import MessagePopup from "@/components/popups/MessagePopup.vue"
import MutingUsersPopup from "@/components/popups/MutingUsersPopup.vue"
import MyFeedsPopup from "@/components/popups/MyFeedsPopup.vue"
import NotificationPopup from "@/components/popups/NotificationPopup.vue"
import RepostUsersPopup from "@/components/popups/RepostUsersPopup.vue"
import ScrollButton from "@/components/buttons/ScrollButton.vue"
import SelectDatePopup from "@/components/popups/SelectDatePopup.vue"
import SelectLabelsPopup from "@/components/popups/SelectLabelsPopup.vue"
import SelectLanguagesPopup from "@/components/popups/SelectLanguagesPopup.vue"
import SendAccountReportPopup from "@/components/popups/SendAccountReportPopup.vue"
import SendFeedReportPopup from "@/components/popups/SendFeedReportPopup.vue"
import SendPostPopup from "@/components/popups/SendPostPopup.vue"
import SendPostReportPopup from "@/components/popups/SendPostReportPopup.vue"
import SettingsPopup from "@/components/popups/SettingsPopup.vue"
import SplashScreen from "@/components/shell-parts/SplashScreen.vue"
import SubMenu from "@/components/shell-parts/SubMenu.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import TimeFeedsPopup from "@/components/popups/TimeFeedsPopup.vue"
import WordMutePopup from "@/components/popups/WordMutePopup.vue"
import state from "@/composables/main-state"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<(name: string, value: any) => void>()

const $t = inject("$t") as Function
state.$setI18n = inject("$setI18n") as Function
state.$getI18n = inject("$getI18n") as Function

resetState()

provide("state", state)

let notificationTimer: null | number = null

onBeforeMount(() => {
  hotkeys("n", { keyup: true }, (event: any) => {
    if (event.type === "keyup" &&
      !state.repostUsersPopupDisplay &&
      !state.likeUsersPopupDisplay &&
      !state.imagePopupProps.display &&
      !state.sendPostPopupProps.display &&
      !state.loginPopupAutoDisplay)
      state.openSendPostPopup({ type: "post" })
  })
})

onBeforeUnmount(() => {
  hotkeys.unbind("n")
})

onMounted(async () => {
  state.currentPath = router.currentRoute.value.path
  state.currentQuery = router.currentRoute.value.query
  state.settings = Util.loadStorage("settings") ?? {}
  state.processing = true
  try {
    if (!await autoLogin()) return
    await Promise.allSettled([
      state.fetchPreferences(),
      state.fetchUserProfile(),
    ])
    state.fetchMyFeedGenerators()
    state.saveSettings()
    state.updateSettings()
    setupNotificationInterval()
    updateInviteCodes()
    processPage(router.currentRoute.value.name as undefined | null | string)
  } finally {
    state.mounted = true
    state.processing = false
    updatePageTitle()

    // ブロードキャスト
    useEventListener(state.broadcastChannel, "message", broadcastListener)

    // インフィニットスクロール用処理
    useEventListener(window, "scroll", scrollListener)
  }
})

onUnmounted(() => {
  clearNotificationInterval()
})

const router = useRouter()

router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  state.currentPath = to.path
  state.currentQuery = to.query

  if (to.path.startsWith("/profile")) {
    if (state.currentQuery.account !== state.currentProfile?.handle &&
        state.currentQuery.account !== state.currentProfile?.did) {
      state.profileFolding = false
      state.currentProfile = null
    } else {
      state.profileFolding = true
    }

    state.inSameProfilePage = state.currentProfile != null
    if (!state.inSameProfilePage) {
      state.currentAuthorFeeds?.splice(0)
      state.currentAuthorFeedsCursor = undefined
      state.currentAuthorFeedsWithReplies?.splice(0)
      state.currentAuthorFeedsWithRepliesCursor = undefined
      state.currentAuthorFeedsWithMedia?.splice(0)
      state.currentAuthorFeedsWithMediaCursor = undefined
      state.currentAuthorCustomFeeds?.splice(0)
      state.currentAuthorCustomFeedsCursor = undefined
      state.currentAuthorReposts?.splice(0)
      state.currentAuthorRepostsCursor = undefined
      state.currentAuthorLikes?.splice(0)
      state.currentAuthorLikesCursor = undefined
      state.currentFollowers?.splice(0)
      state.currentFollowersCursor = undefined
      state.currentFollowings?.splice(0)
      state.currentFollowingsCursor = undefined
      state.currentSuggestedFollows?.splice(0)
    }
  }

  state.currentPosts?.splice(0)

  state.repostUsersPopupDisplay = false
  state.likeUsersPopupDisplay = false
})

router.afterEach(async (to: RouteLocationNormalized) => {
  updatePageTitle()

  // ページフォワード時はページトップへスクロール
  if (window.history.state.forward == null) {
    window.scrollTo(0, 0)
  }

  // Timeline の取得はログイン後 or カーソルボタン押下時 or timelineFeeds が空の時のみ
  if (to.name === "timeline-home" && state.timelineFeeds.length > 0) return

  await processPage(to.name as undefined | null | string)
})

function resetState () {
  state.updateKey = 0
  state.userProfile = null
  state.listProcessing = false
  state.timelineFeeds = []
  state.timelineCursor = undefined
  state.currentPosts = []
  state.inSameProfilePage = false
  state.profileFolding = false
  state.currentProfile = null
  state.currentAuthorFeeds = []
  state.currentAuthorFeedsCursor = undefined
  state.currentAuthorFeedsWithReplies = []
  state.currentAuthorFeedsWithRepliesCursor = undefined
  state.currentAuthorFeedsWithMedia = []
  state.currentAuthorFeedsWithMediaCursor = undefined
  state.currentAuthorCustomFeeds = []
  state.currentAuthorCustomFeedsCursor = undefined
  state.currentAuthorReposts = []
  state.currentAuthorRepostsCursor = undefined
  state.currentAuthorLikes = []
  state.currentAuthorLikesCursor = undefined
  state.currentFollowers = []
  state.currentFollowersCursor = undefined
  state.currentFollowings = []
  state.currentFollowingsCursor = undefined
  state.currentSuggestedFollows = []
  state.currentPreferences = []
  state.currentRepostUsers = []
  state.currentRepostUsersUri = undefined
  state.currentRepostUsersCursor = undefined
  state.currentSearchSuggestionResults = []
  state.currentSearchSuggestionCursor = undefined
  state.currentSearchUsers = []
  state.currentSearchUsersCursor = undefined
  state.currentSearchUserTerm = ""
  state.currentSearchLastUserTerm = ""
  state.currentSearchPostTerm = ""
  state.currentSearchPostResults = []
  state.currentSearchFeeds = []
  state.currentSearchFeedsCursor = undefined
  state.currentSearchFeedsTerm = ""
  state.currentSearchFeedsLastTerm = ""
  state.currentMutingUsers = []
  state.currentMutingUsersCursor = undefined
  state.currentBlockingUsers = []
  state.currentBlockingUsersCursor = undefined
  state.currentPath = ""
  state.currentQuery = {}
  state.currentSetting = {}
  state.globallinePosts = []
  state.globallineProfiles = {}
  state.globallineNumberOfPosts = 0
  state.currentMyFeedGenerators = []
  state.currentMyFeeds = {}
  state.currentPopularFeedGenerators = []
  state.currentPopularFeedGeneratorsCursor = undefined
  state.currentCustomUri = undefined
  state.currentCustomFeeds = []
  state.currentCustomCursor = undefined
  state.inviteCodes = []
  state.notifications = []
  state.notificationCursor = undefined
  state.notificationCount = 0
  state.notificationFetchedFirst = false
  state.scrolledToBottom = false
  state.messagePopupDisplay = false
  state.messagePopupTitle = undefined
  state.messagePopupText = undefined
  state.confirmationPopupDisplay = false
  state.confirmationPopupTitle = undefined
  state.confirmationPopupText = undefined
  state.confirmationPopupDetail = undefined
  state.confirmationPopupResult = false

  // エラーポップアッププロパティ
  state.errorPopupProps.display = false
  state.errorPopupProps.error = undefined
  state.errorPopupProps.description = undefined

  // タイムフィードポップアップ
  state.currentTimeFeeds = []
  state.timeFeedsPopupDisplay = false
  state.timeFeedsPopupProps = undefined

  // 通知ポップアップの表示スイッチ
  state.notificationPopupDisplay = false

  // 設定ポップアップの表示スイッチ
  state.settingsPopupDisplay = false

  // アカウントポップアップの表示スイッチ
  state.accountPopupDisplay = false

  // コンテンツ言語ポップアップの表示スイッチ
  state.contentLanguagesPopupDisplay = false

  // ポスト言語ポップアップの表示スイッチ
  state.postLanguagesPopupDisplay = false

  // ラベル選択ポップアップ
  state.selectLabelsPopupDisplay = false
  state.selectLabelsPopupState = undefined

  // ポスト日時選択ポップアップ
  state.postDatePopupDisplay = false
  state.postDatePopupDate = undefined

  // 招待コード確認ポップアップの表示スイッチ
  state.inviteCodesPopupDisplay = false

  // マイフィードポップアップの表示スイッチ
  state.myFeedsPopupDisplay = false

  // ワードミュートポップアップの表示スイッチ
  state.wordMutePopupDisplay = false

  // コンテンツフィルタリングポップアップの表示スイッチ
  state.contentFilteringPopupDisplay = false

  // ミュートユーザーリストポップアップの表示スイッチ
  state.mutingUsersPopupDisplay = false

  // ブロックユーザーリストポップアップの表示スイッチ
  state.blockingUsersPopupDisplay = false

  // アカウントレポート送信ポップアッププロパティ
  state.sendAccountReportPopupProps.display = false
  state.sendAccountReportPopupProps.user = undefined

  // ポストレポート送信ポップアッププロパティ
  state.sendPostReportPopupProps.display = false
  state.sendPostReportPopupProps.post = undefined

  // フィードレポート送信ポップアッププロパティ
  state.sendFeedReportPopupProps.display = false
  state.sendFeedReportPopupProps.generator = undefined

  // D&D用処理
  state.isDragOver = false

  // ブロードキャスト
  state.broadcastChannel = new BroadcastChannel("klearsky")
}

// ページタイトルの更新
function updatePageTitle () {
  let title = state.notificationCount === 0 ? "" : `(${state.notificationCount}) `
  title += "Klearsky"

  if (state.currentPath.startsWith("/search/"))
    title += ` - ${$t("search")}`

  else if (state.currentPath.startsWith("/profile/") &&
      state.currentProfile?.displayName != null)
    title += ` - ${state.currentProfile.displayName}`

  if (router.currentRoute.value.meta.label != null)
    title += ` - ${$t(router.currentRoute.value.meta.label)}`

  if (state.currentPath === "/home/feeds")
    title += ` - ${state.currentQuery.displayName ?? $t("customFeeds")}`

  else if (state.currentPath.startsWith("/post") &&
      state.currentPosts != null &&
      state.currentPosts.length > 0)
    title += ` - ${state.currentPosts[0].author.displayName}`

  else if (state.currentPath.startsWith("/search/post"))
    title += ` - ${state.currentSearchPostTerm}`

  window.document.title = title
}

async function autoLogin (): Promise<boolean> {
  if (state.atp.hasLogin()) return true
  if (state.atp.canLogin()) {
    const loginResult = await state.atp.login()
    if (!loginResult) return false
    return true
  }
  return false
}

async function manualLogin (service: string, identifier: string, password: string) {
  state.processing = true
  try {
    if (!await state.atp.login(service, identifier, password)) {
      emit("error", $t("loginFailed"))
      return
    }
    if (!state.atp.hasLogin()) return
    await Promise.allSettled([
      state.fetchPreferences(),
      state.fetchUserProfile(),
    ])
    state.fetchMyFeedGenerators()
    state.loginPopupDisplay = false
    state.saveSettings()
    state.updateSettings()
    setupNotificationInterval()
    updateInviteCodes()
    processPage(router.currentRoute.value.name as undefined | null | string)
  } finally {
    state.processing = false
  }
}

async function processPage (pageName?: null | string) {
  let account: null | string = null
  switch (pageName) {
    case "profile-feeds":
    case "profile-feeds-with-replies":
    case "profile-feeds-with-media":
    case "profile-custom-feeds":
    case "profile-repost":
    case "profile-like":
    case "profile-following":
    case "profile-follower":
    case "profile-suggested-follows": {
      account = state.currentQuery.account as LocationQueryValue
      if (!account) {
        await router.push({ name: "timeline-home" })
        break
      }
      break
    }
  }

  state.listProcessing = true
  try {
    switch (pageName) {
      case "profile-feeds": {
        // ブロック情報などを先に取得するために Promise.allSettled はしない
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          await state.fetchCurrentProfile(account as string)
        if (!state.inSameProfilePage || state.currentAuthorFeeds.length === 0)
          await state.fetchCurrentAuthorFeed("new")
        break
      }
      case "profile-feeds-with-replies": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentAuthorFeedsWithReplies.length === 0)
          tasks.push(state.fetchCurrentAuthorFeed("new", "posts_with_replies"))
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-feeds-with-media": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentAuthorFeedsWithMedia.length === 0)
          tasks.push(state.fetchCurrentAuthorFeed("new", "posts_with_media"))
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-repost": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentAuthorReposts.length === 0)
          tasks.push(state.fetchAuthorReposts("new"))
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-like": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentAuthorLikes.length === 0)
          tasks.push(state.fetchAuthorLikes("new"))
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-custom-feeds": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentAuthorCustomFeeds.length === 0)
          tasks.push(state.fetchCurrentAuthorCustomFeeds("new"))
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-following": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentFollowings.length === 0)
          tasks.push(state.fetchFollowings("new"))
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-follower": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentFollowers.length === 0)
          tasks.push(state.fetchFollowers("new"))
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-suggested-follows": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentSuggestedFollows.length === 0)
          tasks.push(state.fetchSuggestedFollows())
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did)
          tasks.push(state.fetchCurrentProfile(account as string))
        await Promise.allSettled(tasks)
        break
      }
      case "timeline-home": {
        await state.fetchTimeline("new")
        break
      }
      case "my-feeds-home": {
        if (Object.keys(state.currentMyFeeds).length === 0)
          await state.fetchMyFeeds()
        break
      }
      case "feeds-home": {
        if (state.currentCustomUri !== state.currentQuery.feed ||
            state.currentCustomFeeds.length === 0)
          await state.fetchCustomFeeds("new")
        break
      }
      case "post": {
        await state.fetchPostThread()
        await nextTick()
        scrollToFocused()
        break
      }
    }
  } finally {
    state.listProcessing = false
  }

  // 現在ページの該当データを取得してからページタイトルを更新
  if (pageName?.startsWith("post") ||
      pageName?.startsWith("profile") ||
      pageName?.startsWith("search-post")) {
    //　TODO: "search-post"　特有の問題のために setTimeout している。使わずに対処すること
    setTimeout(updatePageTitle, 1)
  }
}

function clearNotificationInterval () {
  if (notificationTimer != null) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

async function setupNotificationInterval () {
  clearNotificationInterval()
  await updateNotification()
  // @ts-ignore // TODO:
  notificationTimer = setInterval(updateNotification, CONSTS.INTERVAL_OF_FETCH_NOTIFICATIONS)
}

async function updateNotification () {
  const count = await state.atp.fetchNotificationCount() ?? 0
  const canFetched = state.notificationCount < count
  if (count > 0) {
    state.notificationCount = count
    updatePageTitle()
  }
  if (canFetched) {
    // NOTICE: 念のため + 1 している
    await state.fetchNotifications(Math.min(CONSTS.LIMIT_OF_FETCH_NOTIFICATIONS, count + 1), "new")
  }
}

async function updateInviteCodes () {
  const inviteCodes = await state.atp.fetchInviteCodes()
  if (inviteCodes instanceof Error) return
  state.inviteCodes.splice(0, state.inviteCodes.length, ...inviteCodes)
}

async function closeSendPostPopup (done: boolean) {
  state.closeSendPostPopup(done)
}

function scrollToFocused () {
  const focusElement = document.querySelector("[data-focus='true']")
  if (focusElement != null) focusElement.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

// インフィニットスクロール用処理

let isEnter = false
function scrollListener () {
  const threshold = 64
  const diff = Math.abs(window.scrollY - (
    window.document.documentElement.scrollHeight -
    window.document.documentElement.clientHeight
  ))
  state.scrolledToBottom = false
  if (diff < threshold) {
    if (!isEnter &&
      state.mounted &&
      state.atp.hasLogin() &&
      !state.processing
    ) state.scrolledToBottom = true
    isEnter = true
  } else {
    isEnter = false
  }
}

// D&D用処理

function onDragEnter (event: DragEvent) {
  const types = event.dataTransfer?.types
  if (types == null || !types.includes("Files")) return
  state.isDragOver = true
}

function onDragLeave () {
  state.isDragOver = false
}

function onDrop (event: DragEvent) {
  const files = event.dataTransfer?.files
  if (state.sendPostPopupProps.display)
    state.sendPostPopupProps.fileList = files
  else
    state.openSendPostPopup({
      type: "post",
      fileList: files,
    })
  state.isDragOver = false
}

// ブロードキャスト

function broadcastListener (event: MessageEvent) {
  console.log("[klearsky/broadcast]", event.data.type)
  switch (event.data.type) {
    // セッションの同期
    case "refreshSession": {
      if (event.data.data == null) break
      if (event.data.data.did !== state.atp.data.did) break
      state.atp.resetSession(event.data.data)
      break
    }
  }
}
</script>

<template>
  <div
    class="main-view"
    :key="state.updateKey"
    :data-path="state.currentPath"
    :data-layout="state.currentSetting.layout"
    :style="{
      '--main-area-opacity': state.currentSetting.mainAreaOpacity ?? 1.0,
      '--image-aspect-ratio': state.currentSetting.imageAspectRatio ?? '1 / 1'
    }"
    @dragenter.prevent="onDragEnter"
  >
    <!-- 壁紙 -->
    <div
      class="background-image"
      :style="{
        'background-image': state.backgroundImage,
        'opacity': 1.0 - (state.currentSetting.backgroundOpacity ?? 0)
      }"
    />

    <!-- メインエリア -->
    <div
      v-show="!state.loginPopupAutoDisplay"
      class="main"
    >
      <!-- PC用メニュー -->
      <div class="main-menu-vertical-wrapper">
        <MainMenuVertical />
      </div>

      <!-- SP用メニュー -->
      <div class="main-menu-horizontal-wrapper">
        <MainMenuHorizontal />
      </div>

      <!-- ルータービュー -->
      <div class="router-view-wrapper">
        <!-- ルータービューヘッダー -->
        <div class="router-view-wrapper__header">
          <PortalTarget name="router-view-wrapper-header" />
        </div>

        <RouterView
          v-if="state.mounted"
          @updatePageTitle="updatePageTitle"
        />
      </div>

      <!-- サブメニュー -->
      <div class="sub-menu-wrapper">
        <SubMenu />
      </div>
      <ScrollButton />
    </div>

    <!-- 通知ポップアップ -->
    <NotificationPopup
      v-if="state.notificationPopupDisplay"
      @close="state.closeNotificationPopup"
      @updatePageTitle="updatePageTitle"
    />

    <!-- 設定ポップアップ -->
    <SettingsPopup
      v-if="state.settingsPopupDisplay"
      @close="state.closeSettingsPopup"
    />

    <!-- アカウントポップアップ -->
    <AccountPopup
      v-if="state.accountPopupDisplay"
      @close="state.closeAccountPopup"
    />

    <!-- コンテンツ言語選択ポップアップ -->
    <SelectLanguagesPopup
      v-if="state.contentLanguagesPopupDisplay"
      :state="state.currentSetting"
      property="contentLanguages"
      title="contentLanguages"
      @close="state.closeContentLanguagesPopup"
      @change="state.saveSettings"
    >
      <template #html-popup-content>
        <ul class="bullet-points">
          <li>{{ $t("contentLanguagesDetail1") }}</li>
          <li>{{ $t("contentLanguagesDetail2") }}</li>
          <li>{{ $t("contentLanguagesDetail3") }}</li>
          <li>{{ $t("contentLanguagesDetail4") }}</li>
        </ul>
      </template>
    </SelectLanguagesPopup>

    <!-- タイムフィードポップアップ -->
    <TimeFeedsPopup
      v-if="state.timeFeedsPopupDisplay"
      @close="state.closeTimeFeedsPopup"
    />

    <!-- リポストユーザーリストポップアップ -->
    <RepostUsersPopup
      v-if="state.repostUsersPopupDisplay"
      @close="state.closeRepostUsersPopup"
    />

    <!-- ライクユーザーリストポップアップ -->
    <LikeUsersPopup
      v-if="state.likeUsersPopupDisplay"
      @close="state.closeLikeUsersPopup"
    />

    <!-- 招待コード確認ポップアップ -->
    <InviteCodesPopup
      v-if="state.inviteCodesPopupDisplay"
      @close="state.closeInviteCodesPopup"
    />

    <!-- マイフィードポップアップ -->
    <MyFeedsPopup
      v-if="state.myFeedsPopupDisplay"
      @close="state.closeMyFeedsPopup"
    />

    <!-- ワードミュートポップアップ -->
    <WordMutePopup
      v-if="state.wordMutePopupDisplay"
      @close="state.closeWordMutePopup"
    />

    <!-- コンテンツフィルタリングポップアップ -->
    <ContentFilteringPopup
      v-if="state.contentFilteringPopupDisplay"
      @close="state.closeContentFilteringPopup"
    />

    <!-- ミュートユーザーリストポップアップ -->
    <MutingUsersPopup
      v-if="state.mutingUsersPopupDisplay"
      @close="state.closeMutingUsersPopup"
    />

    <!-- ブロックユーザーリストポップアップ -->
    <BlockingUsersPopup
      v-if="state.blockingUsersPopupDisplay"
      @close="state.closeBlockingUsersPopup"
    />

    <!-- アカウントレポート送信ポップアップ -->
    <SendAccountReportPopup
      v-if="state.sendAccountReportPopupProps.display"
      :user="state.sendAccountReportPopupProps.user as TTUser"
      @close="state.closeSendAccountReportPopup"
    />

    <!-- ポストレポート送信ポップアップ -->
    <SendPostReportPopup
      v-if="state.sendPostReportPopupProps.display"
      :post="state.sendPostReportPopupProps.post as TTPost"
      @close="state.closeSendPostReportPopup"
    />

    <!-- フィードレポート送信ポップアップ -->
    <SendFeedReportPopup
      v-if="state.sendFeedReportPopupProps.display"
      :generator="state.sendFeedReportPopupProps.generator as TTFeedGenerator"
      @close="state.closeSendFeedReportPopup"
    />

    <!-- イメージポップアップ -->
    <ImagePopup
      v-if="state.imagePopupProps.display"
      :images="state.imagePopupProps.images"
      :index="state.imagePopupProps.index"
      @close="state.imagePopupProps.display = false"
    />

    <!-- ポスト送信ポップアップ -->
    <SendPostPopup
      v-if="state.sendPostPopupProps.display"
      :type="state.sendPostPopupProps.type"
      :post="state.sendPostPopupProps.post"
      :text="state.sendPostPopupProps.text"
      :url="state.sendPostPopupProps.url"
      :fileList="state.sendPostPopupProps.fileList"
      :createdAt="state.sendPostPopupProps.createdAt"
      @closeSnedPostPopup="closeSendPostPopup"
    />

    <!-- ポスト言語選択ポップアップ -->
    <SelectLanguagesPopup
      v-if="state.postLanguagesPopupDisplay"
      :state="state.currentSetting"
      property="postLanguages"
      title="postLanguages"
      :limit="3"
      @close="state.closePostLanguagesPopup"
      @change="state.saveSettings"
    >
      <template #html-popup-content>
        <ul class="bullet-points">
          <li>{{ $t("postLanguagesDetail1") }}</li>
          <li>{{ $t("postLanguagesDetail2") }}</li>
        </ul>
      </template>
    </SelectLanguagesPopup>

    <!-- ラベル選択ポップアップ -->
    <SelectLabelsPopup
      v-if="state.selectLabelsPopupDisplay"
      :state="state.selectLabelsPopupState"
      property="labels"
      @close="state.closeSelectLabelsPopup"
      @change=""
    />

    <!-- ポスト日時選択ポップアップ -->
    <SelectDatePopup
      v-if="state.postDatePopupDisplay"
      :date="state.postDatePopupDate"
      textTitle="postDatePopupTitle"
      textDescription="postDatePopupDescription"
      textReset="postDatePopupReset"
      textResetDescription="postDatePopupResetDescription"
      @close="state.closePostDatePopup"
      @onChange="(params: any) => { state.postDatePopupDate = params }"
    />

    <!-- 　D&Dオーバーレイ -->
    <div
      v-if="state.isDragOver"
      class="drag-and-drop-overlay"
      @click="onDragLeave"
      @dragenter.prevent
      @dragover.prevent
      @dragleave.prevent="onDragLeave"
      @drop.prevent.stop="onDrop"
    >
      <SVGIcon name="image" />
    </div>

    <!-- ログインポップアップ -->
    <LoginPopup
      v-if="state.loginPopupAutoDisplay"
      @login="manualLogin"
    />

    <!-- メッセージポップアップ -->
    <MessagePopup
      v-if="state.messagePopupDisplay"
      @close="state.closeMessagePopup"
    />

    <!-- 確認ポップアップ -->
    <ConfirmationPopup
      v-if="state.confirmationPopupDisplay"
      @close="state.closeConfirmationPopup"
      @apply="state.applyConfirmationPopup"
    />

    <!-- エラーポップアップ -->
    <ErrorPopup
      v-if="state.errorPopupProps.display"
      :error="state.errorPopupProps.error"
      :description="state.errorPopupProps.description"
      @close="state.closeErrorPopup"
    />

    <!-- 全画面ローダー -->
    <Loader v-if="state.processing" />

    <!-- スプラッシュスクリーン -->
    <SplashScreen />
  </div>
</template>

<style lang="scss" scoped>
.main-view {
  background-color: rgb(var(--bg-color));
  transition: background-color 500ms ease-out;

  // カスタムレイアウト
  &[data-layout="defaultLeft"],
  &[data-layout="slimLeft"] {
    .main {
      justify-content: unset;
      margin-left: unset;
      margin-right: unset;
    }
  }
  &[data-layout="defaultRight"],
  &[data-layout="slimRight"] {
    .main {
      justify-content: flex-end;
      margin-left: auto;
      margin-right: unset;
    }
  }
  &[data-layout="slim"] .sub-menu-wrapper {
    display: none;
  }
  &[data-layout="slimLeft"] .sub-menu {
    bottom: 3rem;
    right: 0;
  }
  &[data-layout="slimRight"] .sub-menu-wrapper {
    max-width: 0;

    .sub-menu {
      bottom: 3rem;
      left: 0;
    }
  }
  &[data-layout="slim"],
  &[data-layout="slimLeft"],
  &[data-layout="slimRight"] {
    .sub-menu:deep() .copyright {
      display: none;
    }
  }

  // スクロールボタン用処理
  &:deep() .scroll-button {
    @media (max-width: #{$max-width-with-scrollbar + 64px}) {
      display: none;
    }
  }
}

// 壁紙
.background-image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
}

// メインエリア
.main {
  display: flex;
  justify-content: center;
  margin: auto;
  position: relative;
  max-width: $max-width;
  min-height: 100vh;

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    padding-bottom: var(--sp-menu-height);
  }
}

// メインメニュー
.main-menu-vertical-wrapper {
  overflow: hidden;
  position: relative;

  // 最大幅未満
  @media (max-width: $max-width-with-scrollbar) {
    min-width: $main-menu-min-width;
    max-width: $main-menu-min-width;
  }

  // 最大幅以上
  @media not all and (max-width: $max-width-with-scrollbar) {
    min-width: $menu-max-width;
    max-width: $menu-max-width;
  }

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    display: none;
  }

  // カスタムレイアウト
  .main-view[data-layout="slim"] &,
  .main-view[data-layout="slimLeft"] &,
  .main-view[data-layout="slimRight"] & {
    min-width: $main-menu-min-width;
    max-width: $main-menu-min-width;
  }
}

// PC用メニュー
.main-menu-vertical {
  position: fixed;

  // カスタムレイアウト
  .main-view[data-layout="default"] &,
  .main-view[data-layout="defaultLeft"] &,
  .main-view[data-layout="defaultRight"] & {
    // 最大幅以上
    @media not all and (max-width: $max-width-with-scrollbar) {
      min-width: $menu-max-width;
      max-width: $menu-max-width;
    }
  }
}

// SP用メニュー
.main-menu-horizontal-wrapper {
  position: fixed;
  bottom: -1px;
  left: 0;
  z-index: 2;
  width: 100%;

  // SP幅以上
  @media (min-width: $sp-width) {
    display: none;
  }
}

// ルータービュー
.router-view-wrapper {
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
  border-left: 1px solid var(--fg-color-025);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: clip;
  max-width: $router-view-width;

  // タブレット幅以上
  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    border-right: 1px solid var(--fg-color-025);
  }

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    border-left-style: none;
  }

  // ルータービューヘッダー
  &__header {
    position: sticky;
    top: 0;
    z-index: 2;
    width: 100%;
    max-width: $router-view-width;
    &:empty {
      display: none;
    }
  }

  & > .feed-list {
    flex-grow: 1;
  }
}

// サブメニュー
.sub-menu-wrapper {
  @media (max-width: 1024px) {
    display: none;
  }
  @media not all and (max-width: 1024px) {
    flex-grow: 1;
    max-width: $menu-max-width;
  }

  & > .sub-menu {
    position: fixed;
    width: $menu-max-width;
  }
}

// D&Dオーバーレイ
.drag-and-drop-overlay {
  background-color: rgb(var(--bg-color), 0.5);
  border: 0.5rem  solid rgb(var(--accent-color));
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 2;
  width: 100%;
  height: 100%;

  & > .svg-icon {
    fill: rgb(var(--accent-color));
    font-size: 4rem;
    pointer-events: none;
  }
}

// 全画面ローダー
.loader {
  position: fixed;
}
</style>
