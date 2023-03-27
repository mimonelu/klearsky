<script setup lang="ts">
import {
  inject,
  onMounted,
  onUnmounted,
  provide,
  reactive
} from "vue"
import {
  useRouter,
  RouterView
} from "vue-router"
import type {
  LocationQueryValue,
  RouteLocationNormalized,
  RouteRecordName
} from "vue-router"
import ImagePopup from "@/components/ImagePopup.vue"
import Loader from "@/components/Loader.vue"
import LoginPopup from "@/components/LoginPopup.vue"
import MainMenu from "@/components/MainMenu.vue"
import SendPostPopup from "@/components/SendPostPopup.vue"
import SubMenu from "@/components/SubMenu.vue"
import AtpWrapper from "@/composables/atp-wrapper"
import storage from "@/composables/storage"
import waitProp from "@/composables/wait-prop"

const $setI18n = inject("$setI18n") as Function
const $getI18n = inject("$getI18n") as Function

const state = reactive<MainState>({
  // @ts-ignore // TODO:
  atp: new AtpWrapper(),
  mounted: false,
  processing: false,
  loginPopupDisplay: false,
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
  forceUpdate,
  fetchUserProfile,
  fetchCurrentProfile,
  fetchCurrentAuthorFeed,
  fetchTimeline,
  fetchPostThread,
  fetchNotifications,
  fetchFollowers,
  fetchFollowings,
  saveSettings,
  updateSettings,
  updateUserProfile,
  openSendPostPopup,
})

resetState()

provide("state", state)

let notificationTimer: null | number = null

onMounted(async () => {
  state.currentPath = router.currentRoute.value.fullPath
  state.currentQuery = router.currentRoute.value.query
  state.settings = storage.load("settings") ?? {}
  state.processing = true
  try {
    await autoLogin()
    state.saveSettings()
    state.updateSettings()
    await setupNotificationInterval()
    await processPage(router.currentRoute.value.name)
  } finally {
    try {
      await fetchUserProfile()
    } finally {
      state.mounted = true
      state.processing = false
    }
  }
})

onUnmounted(() => {
  clearNotificationInterval()
})

const router = useRouter()

router.beforeEach(() => {
  state.currentFeeds?.splice(0)
  state.currentCursor = undefined
})

router.afterEach(async (to: RouteLocationNormalized) => {
  // ページフォワード時はページトップへスクロール
  if (window.history.state.forward == null) {
    window.scrollTo(0, 0)
  }

  state.currentPath = router.currentRoute.value.fullPath
  state.currentQuery = router.currentRoute.value.query
  // Timeline の取得はログイン後 or カーソルボタン押下時 or timelineFeeds が空の時のみ
  if (to.name === "home" && state.timelineFeeds.length > 0) return

  state.processing = true
  try {
    await processPage(to.name)
  } finally {
    state.processing = false
  }
})

function resetState () {
  state.updateKey = 0
  state.userProfile = null
  state.timelineFeeds = []
  state.timelineCursor = undefined
  state.currentProfile = null
  state.currentFeeds = []
  state.currentCursor = undefined
  state.currentFollowers = []
  state.currentFollowings = []
  state.currentSearchKeywordTerm = ""
  state.currentSearchKeywordResults = []
  state.currentSearchUsers = []
  state.currentSearchUsersCursor = undefined
  state.currentSearchUserTerm = ""
  state.currentSearchLastUserTerm = ""
  state.currentPath = ""
  state.currentQuery = {}
  state.currentSetting = {}
  state.notifications = []
  state.notificationCursor = undefined
  state.notificationCount = 0
}

function saveSettings () {
  const did = state.atp.session?.did
  if (did == null) return
  if (state.settings[did] == null)
    state.settings[did] = {}
  if (state.settings[did].language == null)
    state.settings[did].language = $getI18n()
  if (state.settings[did].colorTheme == null)
    state.settings[did].colorTheme = "auto"
  if (state.settings[did].backgroundImage == null)
    state.settings[did].backgroundImage = ""
  state.currentSetting = state.settings[did]
  storage.save("settings", state.settings)
}

function updateSettings () {
  if (state.currentSetting == null) return
  if (state.currentSetting.language != null) {
    $setI18n(state.currentSetting.language)
    state.forceUpdate()
  }
  if (state.currentSetting.colorTheme != null) {
    window.document.body.setAttribute(
      "data-color-theme",
      state.currentSetting.colorTheme as string
    )
  }
  if (state.currentSetting.backgroundImage != null) {
    window.document.body.style.backgroundImage =
      `url(${state.currentSetting.backgroundImage})`
  }
}

function forceUpdate () {
  state.updateKey = Math.random()
}

async function autoLogin () {
  if (state.atp.hasLogin()) return
  if (state.atp.canLogin()) await state.atp.login()
}

async function manualLogin (service: string, identifier: string, password: string) {
  state.processing = true
  try {
    await state.atp.login(service, identifier, password)
    if (!state.atp.hasLogin()) return
    state.loginPopupDisplay = false
    resetState()
    state.saveSettings()
    state.updateSettings()
    await setupNotificationInterval()
    await processPage(router.currentRoute.value.name)
    await fetchUserProfile()
  } finally {
    state.processing = false
  }
}

async function processPage (pageName?: null | RouteRecordName) {
  let handle: null | string = null
  switch (pageName) {
    case "profile-post":
    case "profile-following":
    case "profile-follower": {
      handle = state.currentQuery.handle as LocationQueryValue
      if (!handle) {
        await router.push({ name: "home" })
        break
      }
      break
    }
  }

  switch (pageName) {
    case "profile-post": {
      const tasks: Array<Promise<void>> = [fetchCurrentAuthorFeed("new")]
      if (handle !== state.currentProfile?.handle)
       tasks.push(fetchCurrentProfile(handle as string))
      await Promise.all(tasks)
      break
    }
    case "profile-following": {
      const tasks: Array<Promise<void>> = [fetchFollowings("new")]
      if (handle !== state.currentProfile?.handle)
       tasks.push(fetchCurrentProfile(handle as string))
      await Promise.all(tasks)
      break
    }
    case "profile-follower": {
      const tasks: Array<Promise<void>> = [fetchFollowers("new")]
      if (handle !== state.currentProfile?.handle)
       tasks.push(fetchCurrentProfile(handle as string))
      await Promise.all(tasks)
      break
    }
    case "home": {
      await fetchTimeline("new")
      break
    }
    case "post": {
      const postUri = state.currentQuery.postUri as LocationQueryValue
      if (!postUri) {
        await router.push({ name: "home" })
        break
      }
      state.currentFeeds?.splice(0)
      state.currentFeeds = await state.atp.fetchPostThread(postUri) ?? []
      break
    }
  }
}

async function fetchTimeline (direction: "old" | "new") {
  const result: null | { feeds: Array<TTFeed>; cursor?: string } =
    await state.atp.fetchTimeline(
      state.timelineFeeds,
      20,
      direction === "old" ? state.timelineCursor : undefined
    )
  if (result == null) return
  state.timelineFeeds = result.feeds
  state.timelineCursor = result.cursor
}

async function fetchPostThread () {
  const uri = state.currentQuery.uri as LocationQueryValue
  if (!uri) return
  state.currentFeeds = await state.atp.fetchPostThread(uri) ?? []
}

async function fetchUserProfile () {
  state.userProfile = await state.atp.fetchProfile(state.atp.session?.handle as string)
}

async function updateUserProfile (profile: TTUpdateProfileParams) {
  state.processing = true
  try {
    await state.atp.updateProfile(profile)
  } finally {
    state.processing = false
  }
}

async function fetchCurrentProfile (handle: string) {
  state.currentProfile = null
  state.currentFollowers.splice(0)
  state.currentFollowings.splice(0)
  state.currentProfile = await state.atp.fetchProfile(handle)
  if (handle === state.atp.session?.handle)
    state.userProfile = state.currentProfile
}

async function fetchCurrentAuthorFeed (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return
  const result: null | { feeds: Array<TTFeed>; cursor?: string } =
    await state.atp.fetchAuthorFeed(
      state.currentFeeds as Array<TTFeed>,
      handle,
      10,
      direction === "old" ? state.currentCursor : undefined
    )
  if (result == null) return
  state.currentFeeds = result.feeds
  state.currentCursor = result.cursor
}

async function fetchFollowings (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return
  const cursor: undefined | string = await state.atp.fetchFollowings(state.currentFollowings, handle, 50, direction === "new" ? undefined : state.currentCursor)
  state.currentCursor = cursor
}

async function fetchFollowers (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return
  const cursor: undefined | string = await state.atp.fetchFollowers(state.currentFollowers, handle, 50, direction === "new" ? undefined : state.currentCursor)
  state.currentCursor = cursor
}

function clearNotificationInterval () {
  if (notificationTimer != null) {
    clearInterval(notificationTimer)
    notificationTimer = null
  }
}

async function setupNotificationInterval () {
  clearNotificationInterval()
  await updateNotification(true)
  notificationTimer = setInterval(() => {
    updateNotification(false)
  }, 1000 * 60)
}

async function fetchNotifications (limit: number, direction: "new" | "old", noNewProp?: boolean) {
  const result: null | {
    cursor?: string
    newNotificationCount: number
  } = await state.atp.fetchNotifications(
    state.notifications,
    limit,
    direction === "new" ? undefined : state.notificationCursor,
    noNewProp
  )
  if (result == null) return
  state.notificationCursor = result.cursor
  // TODO: いったん据え置き
  // state.notificationCount += result.newNotificationCount
}

async function updateNotification (forceUpdate: boolean) {
  const count = await state.atp.fetchNotificationCount() ?? 0
  state.notificationCount = count
  if (count > 0 || forceUpdate) {
    await state.fetchNotifications(forceUpdate ? 50 : Math.min(50, count), "new", forceUpdate)
  }
}

let isSendPostDone = false

async function openSendPostPopup (type: TTPostType, post?: TTPost): Promise<boolean> {
  state.sendPostPopupProps.display = true
  state.sendPostPopupProps.type = type
  state.sendPostPopupProps.post = post
  await waitProp(() => state.sendPostPopupProps.display, false)
  return isSendPostDone
}

function closeSendPostPopup (done: boolean) {
  isSendPostDone = done
  state.sendPostPopupProps.display = false
}
</script>

<template>
  <div
    class="main-view"
    :key="state.updateKey"
  >
    <div class="main">
      <div class="main-menu-wrapper">
        <MainMenu />
      </div>
      <div class="router-view-wrapper">
        <RouterView />
      </div>
      <div class="sub-menu-wrapper">
        <SubMenu />
      </div>
    </div>
    <ImagePopup
      v-if="state.imagePopupProps.display"
      :largeUri="state.imagePopupProps.largeUri"
      :smallUri="state.imagePopupProps.smallUri"
      @close="state.imagePopupProps.display = false"
    />
    <SendPostPopup
      v-if="state.sendPostPopupProps.display"
      :type="state.sendPostPopupProps.type"
      :post="state.sendPostPopupProps.post"
      @close="closeSendPostPopup"
    />
    <LoginPopup
      v-if="state.mounted && (!state.atp.hasLogin() || state.loginPopupDisplay)"
      @login="manualLogin"
    />
    <Loader v-if="state.processing" />
  </div>
</template>

<style lang="scss" scoped>
.main-view {
  & > .loader {
    position: fixed;
  }
}

.main {
  display: flex;
  justify-content: center;
  margin: auto;
  max-width: $max-width;
  min-height: 100vh;
}

.main-menu-wrapper {
  overflow: hidden;
  position: relative;
  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    // border-left: 1px solid rgba(var(--fg-color), 0.25);
  }
  @media (max-width: $max-width-with-scrollbar) {
    min-width: $main-menu-min-width;
    max-width: $main-menu-min-width;
  }
  @media not all and (max-width: $max-width-with-scrollbar) {
    min-width: $menu-max-width;
    max-width: $menu-max-width;
  }

  & > .main-menu {
    position: fixed;
    top: 0;
    @media not all and (max-width: $max-width-with-scrollbar) {
      min-width: $menu-max-width;
      max-width: $menu-max-width;
    }
  }
}

.router-view-wrapper {
  background-color: rgba(var(--bg-color), 0.875);
  border-left: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: $router-view-width;
  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    border-right: 1px solid rgba(var(--fg-color), 0.25);
  }

  & > .feed-list {
    flex-grow: 1;
  }
}

.sub-menu-wrapper {
  @media (max-width: 1024px) {
    display: none;
  }
  @media not all and (max-width: 1024px) {
    // border-right: 1px solid rgba(var(--fg-color), 0.25);
    flex-grow: 1;
    max-width: $menu-max-width;
  }
}

.loader {
  position: fixed;
}
</style>
