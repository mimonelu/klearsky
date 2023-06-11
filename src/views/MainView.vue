<script setup lang="ts">
import { inject, nextTick, onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, provide } from "vue"
import type { LocationQueryValue, RouteLocationNormalized, RouteRecordName } from "vue-router"
import { useRouter } from "vue-router"
import { useEventListener } from "@vueuse/core"
import hotkeys from "hotkeys-js"
import BlockingUsersPopup from "@/components/BlockingUsersPopup.vue"
import ConfirmationPopup from "@/components/ConfirmationPopup.vue"
import ContentFilteringPopup from "@/components/ContentFilteringPopup.vue"
import ErrorPopup from "@/components/ErrorPopup.vue"
import ImagePopup from "@/components/ImagePopup.vue"
import InviteCodesPopup from "@/components/InviteCodesPopup.vue"
import LikeUsersPopup from "@/components/LikeUsersPopup.vue"
import Loader from "@/components/Loader.vue"
import LoginPopup from "@/components/LoginPopup.vue"
import MainMenuHorizontal from "@/components/MainMenuHorizontal.vue"
import MainMenuVertical from "@/components/MainMenuVertical.vue"
import MessagePopup from "@/components/MessagePopup.vue"
import MutingUsersPopup from "@/components/MutingUsersPopup.vue"
import MyFeedsPopup from "@/components/MyFeedsPopup.vue"
import RepostUsersPopup from "@/components/RepostUsersPopup.vue"
import ScrollButton from "@/components/ScrollButton.vue"
import SendAccountReportPopup from "@/components/SendAccountReportPopup.vue"
import SendPostPopup from "@/components/SendPostPopup.vue"
import SendPostReportPopup from "@/components/SendPostReportPopup.vue"
import SplashScreen from "@/components/SplashScreen.vue"
import SubMenu from "@/components/SubMenu.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import WordMutePopup from "@/components/WordMutePopup.vue"
import state from "@/composables/main-state"
import Util from "@/composables/util"
import consts from "@/consts/consts.json"

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
      state.openSendPostPopup("post")
  })
})

onBeforeUnmount(() => {
  hotkeys.unbind("n")
})

onMounted(async () => {
  state.currentPath = router.currentRoute.value.path
  state.currentQuery = router.currentRoute.value.query
  updatePageTitle()
  state.settings = Util.loadStorage("settings") ?? {}
  state.processing = true
  try {
    if (!await autoLogin()) return
    await Promise.allSettled([
      state.fetchPreferences(),
      state.fetchUserProfile(),
    ])
    state.saveSettings()
    state.updateSettings()
    setupNotificationInterval()
    updateInviteCodes()
    processPage(router.currentRoute.value.name)
  } finally {
    state.mounted = true
    state.processing = false

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
    if (state.currentQuery.handle !== state.currentProfile?.handle)
      state.currentProfile = null

    state.inSameProfilePage = state.currentProfile != null
    if (!state.inSameProfilePage) {
      state.currentAuthorFeeds?.splice(0)
      state.currentAuthorCursor = undefined
      state.currentAuthorReposts?.splice(0)
      state.currentAuthorRepostsCursor = undefined
      state.currentAuthorLikes?.splice(0)
      state.currentAuthorLikesCursor = undefined
      state.currentFollowers?.splice(0)
      state.currentFollowersCursor = undefined
      state.currentFollowings?.splice(0)
      state.currentFollowingsCursor = undefined
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

  // HOT の取得はログイン後 or カーソルボタン押下時 or currentHotFeeds が空の時のみ
  if (to.name === "hot" && state.currentHotFeeds.length > 0) return

  await processPage(to.name)
})

function resetState () {
  state.updateKey = 0
  state.userProfile = null
  state.listProcessing = false
  state.timelineFeeds = []
  state.timelineCursor = undefined
  state.currentPosts = []
  state.inSameProfilePage = false
  state.currentProfile = null
  state.currentAuthorFeeds = []
  state.currentAuthorCursor = undefined
  state.currentAuthorReposts = []
  state.currentAuthorRepostsCursor = undefined
  state.currentAuthorLikes = []
  state.currentAuthorLikesCursor = undefined
  state.currentFollowers = []
  state.currentFollowersCursor = undefined
  state.currentFollowings = []
  state.currentFollowingsCursor = undefined
  state.currentPreferences = []
  state.currentHotFeeds = []
  state.currentHotCursor = undefined
  state.currentRepostUsers = []
  state.currentRepostUsersUri = undefined
  state.currentRepostUsersCursor = undefined
  state.currentSearchSuggestionResults = []
  state.currentSearchSuggestionCursor = undefined
  state.currentSearchUsers = []
  state.currentSearchUsersCursor = undefined
  state.currentSearchUserTerm = ""
  state.currentSearchLastUserTerm = ""
  state.currentSearchKeywordTerm = ""
  state.currentSearchKeywordResults = []
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
  state.confirmationPopupResult = false

  // エラーポップアッププロパティ
  state.errorPopupProps.display = false
  state.errorPopupProps.error = undefined
  state.errorPopupProps.description = undefined

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

  // D&D用処理
  state.isDragOver = false

  // ブロードキャスト
  state.broadcastChannel = new BroadcastChannel("klearsky")
}

// ページタイトルの更新
// TODO: /post のタイトルを付けること
function updatePageTitle () {
  let title = "Klearsky"
  switch (state.currentPath) {
    case "/profile/post":
    case "/profile/repost":
    case "/profile/like":
    case "/profile/following":
    case "/profile/follower": {
      title += ` - ${state.currentQuery.handle}`
      break
    }
    case "/feeds/timeline": {
      title += ` - ${state.currentQuery.displayName}`
      break
    }
    default: break
  }
  if (router.currentRoute.value.meta.label != null)
    title += ` - ${$t(router.currentRoute.value.meta.label)}`
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
    state.loginPopupDisplay = false
    state.saveSettings()
    state.updateSettings()
    setupNotificationInterval()
    updateInviteCodes()
    processPage(router.currentRoute.value.name)
  } finally {
    state.processing = false
  }
}

async function processPage (pageName?: null | RouteRecordName) {
  let handle: null | string = null
  switch (pageName) {
    case "profile-post":
    case "profile-repost":
    case "profile-like":
    case "profile-following":
    case "profile-follower": {
      handle = state.currentQuery.handle as LocationQueryValue
      if (!handle) {
        await router.push({ name: "timeline-home" })
        break
      }
      break
    }
  }

  state.listProcessing = true
  try {
    switch (pageName) {
      case "profile-post": {
        // ブロック情報などを先に取得するために Promise.allSettled はしない
        if (handle !== state.currentProfile?.handle)
          await state.fetchCurrentProfile(handle as string)
        if (!state.inSameProfilePage || state.currentAuthorFeeds.length === 0)
          await state.fetchCurrentAuthorFeed("new")
        break
      }
      case "profile-repost": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentAuthorReposts.length === 0)
          tasks.push(state.fetchAuthorReposts("new"))
        if (handle !== state.currentProfile?.handle)
          tasks.push(state.fetchCurrentProfile(handle as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-like": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentAuthorLikes.length === 0)
          tasks.push(state.fetchAuthorLikes("new"))
        if (handle !== state.currentProfile?.handle)
          tasks.push(state.fetchCurrentProfile(handle as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-following": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentFollowings.length === 0)
          tasks.push(state.fetchFollowings("new"))
        if (handle !== state.currentProfile?.handle)
          tasks.push(state.fetchCurrentProfile(handle as string))
        await Promise.allSettled(tasks)
        break
      }
      case "profile-follower": {
        const tasks: Array<Promise<void>> = []
        if (!state.inSameProfilePage || state.currentFollowers.length === 0)
          tasks.push(state.fetchFollowers("new"))
        if (handle !== state.currentProfile?.handle)
          tasks.push(state.fetchCurrentProfile(handle as string))
        await Promise.allSettled(tasks)
        break
      }
      case "notifications": {
        if (!state.notificationFetchedFirst) {
          state.notificationFetchedFirst = true
          await state.fetchNotifications(consts.limitOfFetchNotifications, "new")
        }
        break
      }
      case "timeline-home": {
        await state.fetchTimeline("new")
        break
      }
      case "hot-home": {
        if (state.currentHotFeeds.length === 0)
          await state.fetchHotFeeds("new")
        break
      }
      case "feeds-my": {
        if (Object.keys(state.currentMyFeeds).length === 0)
          await state.fetchMyFeeds()
        break
      }
      case "feeds-popular": {
        if (state.currentPopularFeedGenerators.length === 0)
          await state.fetchPopularFeedGenerators()
        break
      }
      case "feeds-timeline": {
        if (state.currentCustomUri !== state.currentQuery.feed ||
            state.currentCustomFeeds.length === 0)
          await state.fetchCustomFeeds("new")
        break
      }
      case "post": {
        const postUri = state.currentQuery.postUri as LocationQueryValue
        if (!postUri) return
        state.currentPosts?.splice(0)
        state.currentPosts = await state.atp.fetchPostThread(postUri) ?? []
        await nextTick()
        scrollToFocused()
        break
      }
      case "suggestion-search": {
        if (state.currentSearchSuggestionResults.length === 0)
          await state.fetchSuggestions("new")
        break
      }
    }
  } finally {
    state.listProcessing = false
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
  notificationTimer = setInterval(updateNotification, consts.intervalOfFetchNotifications)
}

async function updateNotification () {
  const count = await state.atp.fetchNotificationCount() ?? 0
  const canFetched = state.notificationCount < count
  if (count > 0) state.notificationCount = count
  if (canFetched)
    // NOTICE: 念のため + 1 している
    await state.fetchNotifications(Math.min(consts.limitOfFetchNotifications, count + 1), "new")
}

async function updateInviteCodes () {
  const inviteCodes = await state.atp.fetchInviteCodes()
  if (inviteCodes == null) return
  state.inviteCodes.splice(0, state.inviteCodes.length, ...inviteCodes)
}

async function closeSendPostPopup (done: boolean, empty: boolean) {
  if (empty) {
    state.closeSendPostPopup(done)
    return
  }
  const result = await state.openConfirmationPopup($t("cancelPost"), $t("cancelPostMessage"))
  if (result) state.closeSendPostPopup(done)
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
    state.openSendPostPopup("post", undefined, undefined, files)
  state.isDragOver = false
}

// ブロードキャスト

function broadcastListener (event: MessageEvent) {
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
      '--border-radius': state.currentSetting.borderRadius ?? '0.5em',
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
        <RouterView v-if="state.mounted" />
      </div>

      <!-- サブメニュー -->
      <div class="sub-menu-wrapper">
        <SubMenu />
      </div>
      <ScrollButton />
    </div>

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
      :user="state.sendAccountReportPopupProps.user"
      @close="state.closeSendAccountReportPopup"
    />

    <!-- ポストレポート送信ポップアップ -->
    <SendPostReportPopup
      v-if="state.sendPostReportPopupProps.display"
      :post="state.sendPostReportPopupProps.post"
      @close="state.closeSendPostReportPopup"
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
      :fileList="state.sendPostPopupProps.fileList"
      @closeSnedPostPopup="closeSendPostPopup"
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
  background-color: rgba(var(--bg-color), var(--bg-opacity));

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
  top: 0.5rem;

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
  bottom: 0;
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
  background-color: rgba(var(--bg-color), var(--main-area-opacity));
  border-left: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: $router-view-width;

  // タブレット幅以上
  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    border-right: 1px solid rgba(var(--fg-color), 0.25);
  }

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    border-left-style: none;
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
  background-color: rgba(var(--bg-color), 0.5);
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
