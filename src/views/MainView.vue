<script setup lang="ts">
import { inject, nextTick, onBeforeMount, onBeforeUnmount, onMounted, onUnmounted, provide, ref } from "vue"
import { useRouter, type LocationQueryValue, type RouteLocationNormalized } from "vue-router"
import { useEventListener } from "@vueuse/core"
import hotkeys from "hotkeys-js"
import AccountPopup from "@/components/popups/AccountPopup.vue"
import BlockingUsersPopup from "@/components/popups/BlockingUsersPopup.vue"
import ChatConvoPopover from "@/components/popovers/ChatConvoPopover.vue"
import ChatConvoPopup from "@/components/popups/ChatConvoPopup.vue"
import ChatDeclarationSelectPopover from "@/components/popovers/ChatDeclarationSelectPopover.vue"
import ChatListPopup from "@/components/popups/ChatListPopup.vue"
import ChatMembersSelectPopup from "@/components/popups/ChatMembersSelectPopup.vue"
import ChatMessagePopover from "@/components/popovers/ChatMessagePopover.vue"
import ConfirmationPopup from "@/components/popups/ConfirmationPopup.vue"
import DesignSettingsPopup from "@/components/popups/settings-popups/DesignSettingsPopup.vue"
import ErrorPopup from "@/components/popups/ErrorPopup.vue"
import FeedCardPopover from "@/components/popovers/FeedCardPopover.vue"
import HtmlPopup from "@/components/popups/HtmlPopup.vue"
import ImagePopup from "@/components/popups/ImagePopup.vue"
import InviteCodesPopup from "@/components/popups/InviteCodesPopup.vue"
import KeywordHistoryPopover from "@/components/popovers/KeywordHistoryPopover.vue"
import LabelerListPopup from "@/components/popups/LabelerListPopup.vue"
import LabelerSettingsPopup from "@/components/popups/LabelerSettingsPopup.vue"
import LikeUsersPopup from "@/components/popups/LikeUsersPopup.vue"
import ListCardPopover from "@/components/popovers/ListCardPopover.vue"
import ListEditPopup from "@/components/popups/ListEditPopup.vue"
import ListUserManagementPopup from "@/components/popups/ListUserManagementPopup.vue"
import Loader from "@/components/common/Loader.vue"
import LoginPopup from "@/components/popups/LoginPopup.vue"
import MainMenuHorizontal from "@/components/shell-parts/MainMenuHorizontal.vue"
import MainMenuVertical from "@/components/shell-parts/MainMenuVertical.vue"
import MessagePopup from "@/components/popups/MessagePopup.vue"
import MutingUsersPopup from "@/components/popups/MutingUsersPopup.vue"
import MyFeedsPopup from "@/components/popups/MyFeedsPopup.vue"
import MyFeedsSortPopover from "@/components/popovers/MyFeedsSortPopover.vue"
import MyListPopup from "@/components/popups/MyListPopup.vue"
import MyTagPopup from "@/components/popups/MyTagPopup.vue"
import NotificationPopup from "@/components/popups/NotificationPopup.vue"
import OtherSettingsPopup from "@/components/popups/settings-popups/OtherSettingsPopup.vue"
import PostPopover from "@/components/popovers/PostPopover.vue"
import PostSettingsPopup from "@/components/popups/settings-popups/PostSettingsPopup.vue"
import ProfilePopover from "@/components/popovers/ProfilePopover.vue"
import ProgressPopup from "@/components/popups/ProgressPopup.vue"
import PsySafetySettingsPopup from "@/components/popups/settings-popups/PsySafetySettingsPopup.vue"
import RepostPopover from "@/components/popovers/RepostPopover.vue"
import RepostUsersPopup from "@/components/popups/RepostUsersPopup.vue"
import ScrollButton from "@/components/buttons/ScrollButton.vue"
import SelectDatePopup from "@/components/popups/SelectDatePopup.vue"
import SelectLabelsPopup from "@/components/popups/SelectLabelsPopup.vue"
import SelectLanguagesPopup from "@/components/popups/SelectLanguagesPopup.vue"
import SendAccountReportPopup from "@/components/popups/SendAccountReportPopup.vue"
import SendFeedReportPopup from "@/components/popups/SendFeedReportPopup.vue"
import SendListReportPopup from "@/components/popups/SendListReportPopup.vue"
import SendPostPopup from "@/components/popups/SendPostPopup.vue"
import SendPostReportPopup from "@/components/popups/SendPostReportPopup.vue"
import SettingsPopover from "@/components/popovers/SettingsPopover.vue"
import SplashScreen from "@/components/shell-parts/SplashScreen.vue"
import SubMenu from "@/components/shell-parts/SubMenu.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import ThreadgatePopup from "@/components/popups/ThreadgatePopup.vue"
import TimeFeedsPopup from "@/components/popups/TimeFeedsPopup.vue"
import UiLanguageSettingsPopup from "@/components/popups/settings-popups/UiLanguageSettingsPopup.vue"
import WordMutePopup from "@/components/popups/WordMutePopup.vue"
import { state } from "@/composables/main-state"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const $t = inject("$t") as Function
state.$setCurrentLanguage = inject("$setCurrentLanguage") as Function
state.$getCurrentLanguage = inject("$getCurrentLanguage") as Function
state.updatePageTitle = updatePageTitle

const loginPopup = ref(null)

provide("state", state)

onBeforeMount(() => {
  hotkeys("n", { keyup: true }, (event: any) => {
    if (event.type === "keyup" &&
      !state.repostUsersPopupDisplay &&
      !state.likeUsersPopupDisplay &&
      !state.imagePopupProps.display &&
      !state.sendPostPopupProps.visibility &&
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

  state.loaderDisplay = true
  await autoLogin()
  state.loaderDisplay = false

  state.updatePageTitle()

  // ペースト用処理
  useEventListener(window, "paste", onPaste)

  // ブロードキャスト用処理
  useEventListener(state.broadcastChannel, "message", broadcastListener)

  // インフィニットスクロール用処理
  useEventListener(window, "scroll", scrollListener)

  state.mounted = true
})

onUnmounted(() => {
  clearUpdateJwtInterval()
  state.clearNotificationInterval()
  state.endChatListTimer()
})

const router = useRouter()

router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized) => {
  if (to.name === "home") return

  state.currentPath = to.path
  state.currentQuery = to.query

  if (to.path.startsWith("/profile")) {
    if (state.currentQuery.account !== state.currentProfile?.handle &&
        state.currentQuery.account !== state.currentProfile?.did) {
      state.profileFolding = false
      state.currentProfile = null
      state.currentLabeler = undefined
    } else {
      state.profileFolding = true
    }

    state.inSameProfilePage = state.currentProfile != null
    if (!state.inSameProfilePage) {
      state.resetProfileState()
    }
  }

  state.currentPosts?.splice(0)

  state.repostUsersPopupDisplay = false
  state.likeUsersPopupDisplay = false
})

router.afterEach(async (to: RouteLocationNormalized) => {
  if (to.name === "home") {
    await moveToDefaultHome()
    return
  }

  state.updatePageTitle()

  // ページフォワード時はページトップへスクロール
  if (window.history.state.forward == null) {
    window.scrollTo(0, 0)
  }

  // Timeline の取得はログイン後 or カーソルボタン押下時 or timelineFeeds が空の時のみ
  if (to.name === "timeline-home" && state.timelineFeeds.length > 0) return

  await processPage(to.name as undefined | null | string)
})

// ページタイトルの更新
function updatePageTitle () {
  const unreadCount = state.notificationCount + state.myChat.unread
  let title = unreadCount === 0 ? "" : `(${unreadCount}) `
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

  else if (state.currentPath === "/home/list-feeds")
    title += ` - ${state.currentQuery.displayName ?? $t("listFeeds")}`

  else if (state.currentPath === "/home/list-users")
    title += ` - ${state.currentQuery.displayName ?? $t("listUsers")}`

  else if (state.currentPath.startsWith("/post") &&
      state.currentPosts != null &&
      state.currentPosts.length > 0)
    title += ` - ${state.currentPosts[0].author.displayName}`

  else if (state.currentPath.startsWith("/search/post"))
    title += ` - ${state.currentSearchTerm}`

  window.document.title = title
}

async function signUp (service: string, email: string, handle: string, password: string, inviteCode?: string) {
  state.loaderDisplay = true
  const response = await state.atp.signUp(service, email, handle, password, inviteCode)
  state.loaderDisplay = false
  if (response instanceof Error) {
    state.openErrorPopup($t("getSessionError"), response)
    return
  }
  state.loaderDisplay = true
  await Util.wait(1000)
  state.loaderDisplay = false
  state.loginPopupDisplay = false
  await manualLogin(service, email, handle, password)
}

async function autoLogin () {
  if (state.atp.hasLogin()) {
    await processAfterLogin()
  } else if (state.atp.canLogin()) {
    const response = await state.atp.login(undefined, undefined, undefined, undefined, onRefreshSession)
    if (response instanceof Error) {
      state.openErrorPopup(
        typeof(response.message) === "string"
          ? $t(response.message)
          : response,
        "MainView/autoLogin"
      )
      return
    }
    await processAfterLogin()
  }
}

async function manualLogin (
  service: string,
  _email: string,
  identifier: string,
  password: string,
  authFactorToken?: string
) {
  state.loaderDisplay = true
  const response = await state.atp.login(
    service,
    identifier,
    password,
    authFactorToken,
    onRefreshSession
  )
  state.loaderDisplay = false
  if (response instanceof Error) {
    // 2FAエラー - トークン要求
    if (response.message === "AuthFactorTokenRequired") {
      (loginPopup.value as any)?.setHasAuthFactorToken(true)
      return
    }

    // 手動ログインエラー
    if (!state.atp.hasLogin()) {
      state.openErrorPopup($t("getSessionError"), "MainView/manualLogin")
      return
    }
  }
  state.loginPopupDisplay = false
  state.loaderDisplay = true
  await processAfterLogin()
  state.loaderDisplay = false
}

function onRefreshSession () {
  // セッションの同期
  state.broadcastChannel?.postMessage({
    name: "refreshSession",
    data: Util.cloneJson(state.atp.session),
  } as TTPostMessageData)
}

async function processAfterLogin () {
  setupUpdateJwtInterval()
  setupNotificationInterval()

  // 現在のサーバ情報の取得
  state.fetchCurrentServerInfo()

  // プリファレンスとユーザープロフィールの取得
  const tasks: { [k: string]: any } = {}
  if (state.currentPreferences.length === 0) {
    tasks.currentPreferences = state.fetchPreferences()
  }
  if (state.userProfile == null) {
    tasks.userProfile = state.fetchUserProfile()
  }
  await Promise.allSettled(Object.values(tasks))

  // プリファレンスとユーザープロフィールの取得 - セッションキャッシュの設定
  if (tasks.currentPreferences != null) {
    state.myWorker.setSessionCache("currentPreferences", state.currentPreferences)
  }
  if (tasks.userProfile != null) {
    state.myWorker.setSessionCache("userProfile", state.userProfile)
  }

  // ラベラーの取得
  state.myLabeler.updateMyLabelers()
    .then(() => {
      // ラベラーのHTTPヘッダーを設定
      state.myLabeler.setAtprotoAcceptLabelers()
    })

  // マイフィードの取得
  if (state.myFeeds.items.length === 0) {
    state.myFeeds.fetchItems()
      .then(() => {
        state.myFeeds.sortItems()
        state.myFeeds.synchronizeToMyList()

        // セッションキャッシュの設定
        state.myWorker.setSessionCache("myFeeds.items", state.myFeeds.items)
      })
  }

  // 全マイリストと全マイリストユーザーの取得
  if (state.myLists.items.length === 0) {
    state.myLists.fetchAll()
      .then(() => {
        state.myFeeds.synchronizeToMyList()

        // セッションキャッシュの設定
        state.myWorker.setSessionCache("myList", state.myLists.items)
      })
  }

  // チャットの利用可否を更新
  await state.myChat.updateDisabled()

  // チャット一覧の更新とチャットタイマーの起動
  if (!state.myChat.disabled) {
    state.myChat.updateConvosAll()
      .then((result) => {
        if (!result) {
          return
        }
        state.updatePageTitle()
        state.startChatListTimer()
      })
  }

  // 招待コードの取得
  if (state.inviteCodes.length === 0) {
    state.updateInviteCodes()
      .then(() => {

        // セッションキャッシュの設定
        state.myWorker.setSessionCache("inviteCodes", state.inviteCodes)
      })
  }

  state.saveSettings()
  state.updateSettings()

  if (router.currentRoute.value.name === "home") {
    await moveToDefaultHome()
    return
  }
  processPage(router.currentRoute.value.name as undefined | null | string)
}

async function moveToDefaultHome () {
  const pinnedItems = state.myFeeds.pinnedItems
  const firstPinnedItem = pinnedItems[0]
  if (firstPinnedItem == null) {
    await router.replace("/home/timeline")
  } else if (firstPinnedItem.kind === "feed") {
    await router.replace({
      path: "/home/feeds",
      query: {
        feed: firstPinnedItem.value.uri,
        displayName: firstPinnedItem.value.displayName,
      },
    })
  } else if (firstPinnedItem.kind === "list") {
    await router.replace({
      path: "/home/list-feeds",
      query: {
        list: firstPinnedItem.value.uri,
        displayName: firstPinnedItem.value.name,
      },
    })
  } else {
    await router.push("/home/timeline")
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
    case "profile-list":
    case "profile-following":
    case "profile-follower":
    case "profile-suggested-follows": {
      account = state.currentQuery.account as LocationQueryValue
      if (!account) {
        await router.push({ name: "home" })
        break
      }
      break
    }
  }

  state.listLoaderDisplay = true
  try {
    switch (pageName) {
      case "profile-feeds": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentAuthorFeeds.length === 0) {
          await state.fetchCurrentAuthorFeed("new")
        }
        break
      }
      case "profile-feeds-with-replies": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentAuthorFeedsWithReplies.length === 0) {
          await state.fetchCurrentAuthorFeed("new", "posts_with_replies")
        }
        break
      }
      case "profile-feeds-with-media": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentAuthorFeedsWithMedia.length === 0) {
          await state.fetchCurrentAuthorFeed("new", "posts_with_media")
        }
        break
      }
      case "profile-repost": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentAuthorReposts.length === 0) {
          await state.fetchAuthorReposts("new")
        }
        break
      }
      case "profile-like": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentAuthorLikes.length === 0) {
          await state.fetchAuthorLikes("new")
        }
        break
      }
      case "profile-list": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.isMyProfile() && (!state.inSameProfilePage || state.currentAuthorLists.length === 0)) {
          await state.fetchAuthorLists("new")
        }
        break
      }
      case "profile-custom-feeds": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentAuthorCustomFeeds.length === 0) {
          await state.fetchCurrentAuthorCustomFeeds("new")
        }
        break
      }
      case "profile-following": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentFollowings.length === 0) {
          await state.fetchFollowings("new")
        }
        break
      }
      case "profile-follower": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentFollowers.length === 0) {
          await state.fetchFollowers("new")
        }
        break
      }
      case "profile-suggested-follows": {
        if (account !== state.currentProfile?.handle &&
            account !== state.currentProfile?.did) {
          // DIDやブロック情報などを先に取得するために並列処理はしない
          await state.fetchCurrentProfile(account as string)
        }
        if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
          state.myLabeler.updateCurrentLabeler(state.currentProfile.did)
        }
        if (!state.inSameProfilePage || state.currentSuggestedFollows.length === 0) {
          await state.fetchSuggestedFollows()
        }
        break
      }
      case "timeline-home": {
        await state.fetchTimeline("new")
        break
      }
      case "feeds-home": {
        if (state.currentCustomFeedsUri !== state.currentQuery.feed ||
            state.currentCustomFeeds.length === 0)
          await state.fetchCustomFeeds("new")
        break
      }
      case "list-feeds-home": {
        await updateCurrentList()
        if (state.currentListFeeds.length === 0)
          await state.fetchCurrentListFeeds("new")
        break
      }
      case "list-users-home": {
        await updateCurrentList()
        if (state.currentListItems.length === 0)
          await state.fetchCurrentListItems("new")
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
    state.listLoaderDisplay = false
  }

  // 現在ページの該当データを取得してからページタイトルを更新
  if (pageName?.startsWith("post") ||
      pageName?.startsWith("profile") ||
      pageName?.startsWith("search-post")) {
    // TODO: "search-post" 特有の問題のために setTimeout している。使わずに対処すること
    setTimeout(state.updatePageTitle, 1)
  }
}

let updateJwtTimer: null | number = null

function clearUpdateJwtInterval () {
  if (updateJwtTimer != null) {
    clearInterval(updateJwtTimer)
    updateJwtTimer = null
  }
}

async function setupUpdateJwtInterval () {
  clearUpdateJwtInterval()
  // @ts-ignore // TODO:
  updateJwtTimer = setInterval(() => {
    state.atp.updateJwt(onRefreshSession)
  }, CONSTS.INTERVAL_OF_UPDATE_JWT)
}

async function setupNotificationInterval () {
  state.updateNotificationInterval()
  await state.updateNotifications()
}

async function updateCurrentList () {
  const listUri: undefined | string = state.currentQuery.list
  if (listUri == null) return
  if (state.currentList?.uri === listUri) return

  // リストデータのリセット
  state.currentListFeeds.splice(0)
  state.currentListFeedsCursor = undefined
  state.currentListItems.splice(0)
  state.currentListItemsCursor = undefined

  // 現在のリストを取得
  // マイリスト → 現在のプロフィールユーザーリスト →　APIの順で取得
  state.currentList = undefined
  state.currentList = state.myLists.items.find((list: TTList) => {
    return list.uri === listUri
  })
  if (state.currentList == null) {
    state.currentList = state.currentAuthorLists.find((list: TTList) => {
      return list.uri === listUri
    })
    if (state.currentList == null) {
      await state.fetchCurrentList(listUri)
    }
  }
}

async function closeSendPostPopup (done: boolean, hidden: boolean) {
  state.closeSendPostPopup(done, hidden)
}

function scrollToFocused () {
  const focusElement = document.querySelector("[data-focus='true']")
  if (focusElement != null) focusElement.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

// 設定用

function saveSetting () {
  state.saveSettings()
}

function changeSetting () {
  state.saveSettings()
  state.updateSettings()
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
      !state.loaderDisplay &&
      !state.listLoaderDisplay
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
  state.isDragOver = false
  if (!state.atp.hasLogin()) return
  if (event.dataTransfer?.items == null) return
  attachFilesToPost(event.dataTransfer.items)
}

// ペースト用処理

function onPaste (event: ClipboardEvent) {
  if (!state.atp.hasLogin()) return
  if (event.clipboardData?.items == null) return
  if (attachFilesToPost(event.clipboardData.items)) {
    // ファイル名がテキストエリアにペーストされる現象を回避
    event.preventDefault()
  }
}

// D&D・ペースト用処理共通

function attachFilesToPost (items: DataTransferItemList): boolean {
  // 対象は画像ファイルのみ
  const imageItems = Array.from(items)
    .filter((item: DataTransferItem) => {
      return item.kind === "file" && item.type.startsWith("image")
    })
  if (imageItems.length === 0) return false

  const fileList = imageItems
    .map((item: DataTransferItem) => {
      return item.getAsFile()
    }) as unknown as FileList
  if (state.sendPostPopupProps.visibility) {
    state.sendPostPopupProps.fileList = fileList
  } else {
    state.openSendPostPopup({
      type: "post",
      fileList,
    })
  }
  return true
}

// ブロードキャスト用処理

function broadcastListener (event: MessageEvent) {
  console.log("[klearsky/broadcast]", event.data.name)
  switch (event.data.name) {
    // セッションの同期
    case "refreshSession": {
      if (event.data.data == null) break
      if (event.data.data.did !== state.atp.data.did) break
      state.atp.resetSession(event.data.data)
      break
    }

    // セッションキャッシュの反映
    case "setSessionCacheResponse": {
      const data: TTPostMessageData = event.data
      if (data.did != state.atp.data.did || data.key == null || data.value == null) {
        break
      }
      switch (data.key) {
        // セッションキャッシュの反映 - プリファレンス
        case "currentPreferences": {
          state.currentPreferences = data.value
          break
        }

        // セッションキャッシュの反映 - ユーザープロフィール
        case "userProfile": {
          state.userProfile = data.value
          break
        }

        // セッションキャッシュの反映 - マイフィード
        case "myFeeds.items": {
          state.myFeeds.items.splice(0, state.myFeeds.items.length, ...data.value)
          state.myFeeds.synchronizeToMyList()
          break
        }

        // セッションキャッシュの反映 - マイリスト
        case "myList": {
          state.myLists.items = data.value
          state.myFeeds.synchronizeToMyList()
          break
        }

        // セッションキャッシュの反映 - 招待コード
        case "inviteCodes": {
          state.inviteCodes = data.value
          break
        }

        default: break
      }
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
    :style="{
      '--main-area-opacity': state.currentSetting.mainAreaOpacity ?? 1.0,
    }"
    @dragenter.prevent="onDragEnter"
  >
    <!-- 壁紙 -->
    <div
      class="background-image"
      :style="{
        'background-image': state.backgroundImage,
        'opacity': 1.0 - (state.currentSetting.backgroundOpacity ?? 0),
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
          @updatePageTitle="state.updatePageTitle"
        />

        <!-- 中央ローダー -->
        <Loader
          v-if="state.centerLoaderDisplay"
          class="center-loader"
        />
      </div>

      <!-- サブメニュー -->
      <div class="sub-menu-wrapper">
        <SubMenu />
      </div>

      <ScrollButton />
    </div>

    <!-- 設定ポップオーバー -->
    <SettingsPopover
      v-if="state.settingsPopoverDisplay"
      @close="state.closeSettingsPopover"
    />

    <!-- プロフィールポップオーバー -->
    <ProfilePopover
      v-if="state.profilePopoverProps.display"
      v-bind="state.profilePopoverProps"
      @close="state.closeProfilePopover"
    />

    <!-- ポストポップオーバー -->
    <PostPopover
      v-if="state.postPopoverProps.display"
      v-bind="state.postPopoverProps"
      @close="state.closePostPopover"
    />

    <!-- リポストポップオーバー -->
    <RepostPopover
      v-if="state.repostPopoverProps.display"
      v-bind="state.repostPopoverProps"
      @close="state.closeRepostPopover"
    />

    <!-- フィードカードポップオーバー -->
    <FeedCardPopover
      v-if="state.feedCardPopoverProps.display"
      v-bind="state.feedCardPopoverProps"
      @close="state.closeFeedCardPopover"
    />

    <!-- リストカードポップオーバー -->
    <ListCardPopover
      v-if="state.listCardPopoverProps.display"
      v-bind="state.listCardPopoverProps"
      @close="state.closeListCardPopover"
    />

    <!-- マイフィードソートポップオーバー -->
    <MyFeedsSortPopover
      v-if="state.myFeedsSortPopoverProps.display"
      v-bind="state.myFeedsSortPopoverProps"
      @close="state.closeMyFeedsSortPopover"
    />

    <!-- チャットルームポップオーバー -->
    <ChatConvoPopover
      v-if="state.chatConvoPopoverProps.display"
      v-bind="state.chatConvoPopoverProps"
      @close="state.closeChatConvoPopover"
    />

    <!-- チャット公開設定ポップオーバー -->
    <ChatDeclarationSelectPopover
      v-if="state.chatDeclarationSelectPopoverProps.display"
      v-bind="state.chatDeclarationSelectPopoverProps"
      @close="state.closeChatDeclarationSelectPopover"
    />

    <!-- チャットメッセージポップオーバー -->
    <ChatMessagePopover
      v-if="state.chatMessagePopoverProps.display"
      v-bind="state.chatMessagePopoverProps"
      @close="state.closeChatMessagePopover"
    />

    <!-- キーワード履歴ポップオーバー -->
    <KeywordHistoryPopover
      v-if="state.keywordHistoryPopoverProps.display"
      v-bind="state.keywordHistoryPopoverProps"
      @close="state.closeKeywordHistoryPopover"
    />

    <!-- ポップアップコンテナ -->
    <div class="popup-container">
      <!-- 通知ポップアップ -->
      <Transition>
        <NotificationPopup
          v-if="state.notificationPopupDisplay"
          @close="state.closeNotificationPopup"
          @updatePageTitle="state.updatePageTitle"
        />
      </Transition>

      <!-- 設定 - UI言語設定ポップアップ -->
      <Transition>
        <UiLanguageSettingsPopup
          v-if="state.uiLanguageSettingsPopupDisplay"
          @close="state.closeUiLanguageSettingsPopup"
          @changeSetting="changeSetting"
        />
      </Transition>

      <!-- 設定 - デザイン設定ポップアップ -->
      <Transition>
        <DesignSettingsPopup
          v-if="state.designSettingsPopupDisplay"
          @close="state.closeDesignSettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
          @showDescription="state.openHtmlPopup"
        />
      </Transition>

      <!-- 設定 - ポスト設定ポップアップ -->
      <Transition>
        <PostSettingsPopup
          v-if="state.postSettingsPopupDisplay"
          @close="state.closePostSettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
          @showDescription="state.openHtmlPopup"
        />
      </Transition>

      <!-- 設定 - 心理的安全性設定ポップアップ -->
      <Transition>
        <PsySafetySettingsPopup
          v-if="state.psySafetySettingsPopupDisplay"
          @close="state.closePsySafetySettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
        />
      </Transition>

      <!-- 設定 - その他設定ポップアップ -->
      <Transition>
        <OtherSettingsPopup
          v-if="state.otherSettingsPopupDisplay"
          @close="state.closeOtherSettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
          @showDescription="state.openHtmlPopup"
        />
      </Transition>

      <!-- 設定 - 招待コード確認ポップアップ -->
      <Transition>
        <InviteCodesPopup
          v-if="state.inviteCodesPopupDisplay"
          @close="state.closeInviteCodesPopup"
        />
      </Transition>

      <!-- アカウントポップアップ -->
      <Transition>
        <AccountPopup
          v-if="state.accountPopupDisplay"
          @close="state.closeAccountPopup"
        />
      </Transition>

      <!-- コンテンツ言語選択ポップアップ -->
      <Transition>
        <SelectLanguagesPopup
          v-if="state.contentLanguagesPopupDisplay"
          :state="state.currentSetting"
          property="contentLanguages"
          title="contentLanguages"
          :hasHelpButton="true"
          @close="state.closeContentLanguagesPopup"
          @change="state.saveSettings"
        />
      </Transition>

      <!-- タイムフィードポップアップ -->
      <Transition>
        <TimeFeedsPopup
          v-if="state.timeFeedsPopupDisplay"
          @close="state.closeTimeFeedsPopup"
        />
      </Transition>

      <!-- リポストユーザーリストポップアップ -->
      <Transition>
        <RepostUsersPopup
          v-if="state.repostUsersPopupDisplay"
          @close="state.closeRepostUsersPopup"
        />
      </Transition>

      <!-- ライクユーザーリストポップアップ -->
      <Transition>
        <LikeUsersPopup
          v-if="state.likeUsersPopupDisplay"
          @close="state.closeLikeUsersPopup"
        />
      </Transition>

      <!-- マイフィードポップアップ -->
      <Transition>
        <MyFeedsPopup
          v-if="state.myFeedsPopupDisplay"
          @close="state.closeMyFeedsPopup"
        />
      </Transition>

      <!-- マイリストポップアップ -->
      <Transition>
        <MyListPopup
          v-if="state.myListPopupDisplay"
          @close="state.closeMyListPopup"
        />
      </Transition>

      <!-- リスト編集ポップアップ -->
      <Transition>
        <ListEditPopup
          v-if="state.listEditPopupProps.display"
          v-bind="state.listEditPopupProps"
          @close="state.closeListEditPopup"
        />
      </Transition>

      <!-- ワードミュートポップアップ -->
      <Transition>
        <WordMutePopup
          v-if="state.wordMutePopupDisplay"
          @close="state.closeWordMutePopup"
        />
      </Transition>

      <!-- チャット一覧ポップアップ -->
      <Transition>
        <ChatListPopup
          v-if="state.chatListPopupProps.display"
          v-bind="state.chatListPopupProps"
          @close="state.closeChatListPopup"
        />
      </Transition>

      <!-- チャットルームポップアップ -->
      <Transition>
        <ChatConvoPopup
          v-if="state.chatConvoPopupProps.display"
          v-bind="state.chatConvoPopupProps"
          @close="state.closeChatConvoPopup"
        />
      </Transition>

      <!-- チャットメンバー選択ポップアップ -->
      <Transition>
        <ChatMembersSelectPopup
          v-if="state.chatMembersSelectPopupProps.display"
          v-bind="state.chatMembersSelectPopupProps"
          @close="state.closeChatMembersSelectPopup"
        />
      </Transition>

      <!-- ラベラー一覧ポップアップ -->
      <Transition>
        <LabelerListPopup
          v-if="state.labelerListPopupProps.display"
          v-bind="state.labelerListPopupProps"
          @close="state.closeLabelerListPopup"
        />
      </Transition>

      <!-- ラベラー設定ポップアップ -->
      <Transition>
        <LabelerSettingsPopup
          v-if="state.labelerSettingsPopupProps.display"
          v-bind="state.labelerSettingsPopupProps"
          @close="state.closeLabelerSettingsPopup"
        />
      </Transition>

      <!-- ミュートユーザーリストポップアップ -->
      <Transition>
        <MutingUsersPopup
          v-if="state.mutingUsersPopupDisplay"
          @close="state.closeMutingUsersPopup"
        />
      </Transition>

      <!-- ブロックユーザーリストポップアップ -->
      <Transition>
        <BlockingUsersPopup
          v-if="state.blockingUsersPopupDisplay"
          @close="state.closeBlockingUsersPopup"
        />
      </Transition>

      <!-- リストユーザー管理ポップアップ -->
      <Transition>
        <ListUserManagementPopup
          v-if="state.listUserManagementPopupProps.display"
          v-bind="state.listUserManagementPopupProps"
          @close="state.closeListUserManagementPopup"
        />
      </Transition>

      <!-- アカウントレポート送信ポップアップ -->
      <Transition>
        <SendAccountReportPopup
          v-if="state.sendAccountReportPopupProps.display"
          :user="state.sendAccountReportPopupProps.user as TTUser"
          @close="state.closeSendAccountReportPopup"
        />
      </Transition>

      <!-- ポストレポート送信ポップアップ -->
      <Transition>
        <SendPostReportPopup
          v-if="state.sendPostReportPopupProps.display"
          :post="state.sendPostReportPopupProps.post as TTPost"
          @close="state.closeSendPostReportPopup"
        />
      </Transition>

      <!-- フィードレポート送信ポップアップ -->
      <Transition>
        <SendFeedReportPopup
          v-if="state.sendFeedReportPopupProps.display"
          :generator="state.sendFeedReportPopupProps.generator as TTFeedGenerator"
          @close="state.closeSendFeedReportPopup"
        />
      </Transition>

      <!-- リストレポート送信ポップアップ -->
      <Transition>
        <SendListReportPopup
          v-if="state.sendListReportPopupProps.display"
          :list="state.sendListReportPopupProps.list as TTList"
          @close="state.closeSendListReportPopup"
        />
      </Transition>

      <!-- イメージポップアップ -->
      <Transition>
        <ImagePopup
          v-if="state.imagePopupProps.display"
          v-bind="state.imagePopupProps"
          @close="state.imagePopupProps.display = false"
        />
      </Transition>

      <!-- ポスト送信ポップアップ -->
      <Transition>
        <SendPostPopup
          v-if="state.sendPostPopupProps.display"
          v-show="state.sendPostPopupProps.visibility"
          :type="state.sendPostPopupProps.type"
          :post="state.sendPostPopupProps.post"
          :text="state.sendPostPopupProps.text"
          :url="state.sendPostPopupProps.url"
          :fileList="state.sendPostPopupProps.fileList"
          :createdAt="state.sendPostPopupProps.createdAt"
          @closeSendPostPopup="closeSendPostPopup"
        />
      </Transition>

      <!-- マイタグポップアップ -->
      <Transition>
        <MyTagPopup
          v-if="state.myTagPopupProps.display"
          v-bind="state.myTagPopupProps"
          @close="state.closeMyTagPopup"
        />
      </Transition>

      <!-- ポスト言語選択ポップアップ -->
      <Transition>
        <SelectLanguagesPopup
          v-if="state.postLanguagesPopupDisplay"
          :state="state.currentSetting"
          property="postLanguages"
          title="postLanguages"
          :limit="3"
          @close="state.closePostLanguagesPopup"
          @change="state.saveSettings"
        />
      </Transition>

      <!-- ラベル選択ポップアップ -->
      <Transition>
        <SelectLabelsPopup
          v-if="state.selectLabelsPopupDisplay"
          :state="state.selectLabelsPopupState"
          @close="state.closeSelectLabelsPopup"
          @change=""
        />
      </Transition>

      <!-- ポスト日時選択ポップアップ -->
      <Transition>
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
      </Transition>

      <!-- Threadgate ポップアップ -->
      <Transition>
        <ThreadgatePopup
          v-if="state.threadgatePopupProps.display"
          v-bind="state.threadgatePopupProps"
          @close="state.closeThreadgatePopup"
        />
      </Transition>

      <!-- 設定 - 説明用HTMLポップアップ -->
      <Transition>
        <HtmlPopup
          v-if="state.htmlPopupProps.display"
          :title="`${$t('help')} - ${$t(state.htmlPopupProps.type)}`"
          @close="state.closeHtmlPopup"
        >
          <template v-if="state.htmlPopupProps.type === 'contentLanguages'">
            <ul class="bullet-points">
              <li>{{ $t("contentLanguagesDetail1") }}</li>
              <li>{{ $t("contentLanguagesDetail2") }}</li>
              <li>{{ $t("contentLanguagesDetail3") }}</li>
              <li>{{ $t("contentLanguagesDetail4") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'postLanguages'">
            <ul class="bullet-points">
              <li>{{ $t("postLanguagesDetail1") }}</li>
              <li>{{ $t("postLanguagesDetail2") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'autoTranslation'">
            <ul class="bullet-points">
              <li>{{ $t("autoTranslationRemarks1") }}</li>
              <li>{{ $t("autoTranslationRemarks2") }}</li>
              <li>{{ $t("autoTranslationRemarks3") }}</li>
              <li>
                <a class="textlink" href="https://mymemory.translated.net/" rel="noreferrer" target="_blank">
                  <span>{{ $t("autoTranslationRemarks4") }}</span>
                </a>
              </li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'autoTranslationIgnoreLanguage'">
            <ul class="bullet-points">
              <li>
                <a class="textlink" href="https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" rel="noreferrer" target="_blank">
                  <span>List of ISO 639-1 codes</span>
                </a>
              </li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'backgroundImage'">
            <ul class="bullet-points">
              <li>{{ $t("backgroundImage1") }}</li>
              <li>{{ $t("backgroundImage2") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'timelineControl'">
            <ul class="bullet-points">
              <li>{{ $t("timelineControlDescription") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'lightning'">
            <ul class="bullet-points">
              <li>{{ $t("lightningDescription") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'post'">
            <ul class="bullet-points">
              <li>{{ $t("sendPostNotification1") }}</li>
              <li>{{ $t("sendPostNotification2") }}</li>
              <li>{{ $t("sendPostNotification3") }}</li>
              <li>{{ $t("sendPostNotification4") }}</li>
              <li>{{ $t("sendPostNotification5") }}</li>
            </ul>
          </template>
        </HtmlPopup>
      </Transition>

      <!-- 　D&Dオーバーレイ -->
      <Transition>
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
      </Transition>

      <!-- ログインポップアップ -->
      <Transition>
        <LoginPopup
          v-if="state.loginPopupAutoDisplay"
          ref="loginPopup"
          @signUp="signUp"
          @login="manualLogin"
        />
      </Transition>

      <!-- メッセージポップアップ -->
      <Transition>
        <MessagePopup
          v-if="state.messagePopupProps.display"
          @close="state.closeMessagePopup"
        />
      </Transition>

      <!-- 確認ポップアップ -->
      <Transition>
        <ConfirmationPopup
          v-if="state.confirmationPopupDisplay"
          @close="state.closeConfirmationPopup"
          @apply="state.applyConfirmationPopup"
        />
      </Transition>

      <!-- エラーポップアップ -->
      <Transition>
        <ErrorPopup
          v-if="state.errorPopupProps.display"
          :error="state.errorPopupProps.error"
          :description="state.errorPopupProps.description"
          @close="state.closeErrorPopup"
        />
      </Transition>
    </div>

    <!-- 進捗ポップアップ -->
    <ProgressPopup
      v-if="state.progressPopupDisplay"
      v-bind="state.progressPopupProps"
    />

    <!-- 全画面ローダー -->
    <Loader
      v-if="state.loaderDisplay"
      class="fullscreen-loader"
    />

    <!-- スプラッシュスクリーン -->
    <SplashScreen />
  </div>
</template>

<style lang="scss" scoped>
.main-view {
  background-color: rgb(var(--bg-color));
  transition: background-color 500ms ease-out;

  // ポップアップの重なり調整
  @for $i from 2 through 8 {
    $margins: (
      2: 1,
      3: 1.5,
      4: 2,
      5: 2.5,
      6: 3,
      7: 3.5,
      8: 4
    );
    &:deep() .popup-container > div:nth-of-type(#{$i}) {
      &.popup-overlay,
      & > .popup-overlay {
        & > .popup {
          --margin: #{map-get($margins, $i)}rem;
        }
      }
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
// PC用メニュー
.main-menu-vertical-wrapper,
.main-menu-vertical {
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
}

// メインメニュー
.main-menu-vertical-wrapper {
  overflow: hidden;
  position: relative;

  // SP幅未満
  @media not all and (min-width: $sp-width) {
    display: none;
  }
}

// PC用メニュー
.main-menu-vertical {
  position: fixed;
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: clip;
  max-width: $router-view-width;

  // ルータービューヘッダー
  &__header {
    display: grid;
    position: sticky;
    top: 0;
    z-index: 2;
    width: 100%;
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

// 中央ローダー
.center-loader {
  margin: 0 auto;
  position: fixed;
  left: 0;
  right: 0;
  max-width: $router-view-width;
}

// 全画面ローダー
.fullscreen-loader {
  position: fixed;
}
</style>
