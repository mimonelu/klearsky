<script setup lang="ts">
import {
  onMounted,
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
import Loader from "@/components/Loader.vue"
import LoginPopup from "@/components/LoginPopup.vue"
import MainMenu from "@/components/MainMenu.vue"
import SendPostPopup from "@/components/SendPostPopup.vue"
import SubMenu from "@/components/SubMenu.vue"
import AtpWrapper from "@/composables/atp-wrapper"

const state = reactive<MainState>({
  // @ts-ignore // TODO:
  atp: new AtpWrapper(),
  mounted: false,
  hasLogin: false,
  userProfile: null,
  timelineFeeds: [],
  timelineCursor: undefined, // TODO:
  currentProfile: null,
  currentFeeds: null,
  currentCursor: null,
  currentUsers: null,
  currentQuery: {},
  notifications: [],
  notificationCursor: undefined, // TODO:
  processing: false,
  challengingAccount: {},
  sendPostPopupProps: {
    visibility: false,
    type: "post",
    post: null,
  },
  createFollow,
  deleteFollow,
  fetchUserProfile,
  fetchCurrentProfile,
  fetchCurrentAuthorFeed,
  fetchNotifications,
  fetchFeeds,
  updateUserProfile,
  openSendPostPopup,
})

provide("state", state)

onMounted(async () => {
  state.currentQuery = router.currentRoute.value.query
  state.hasLogin = state.atp.hasLogin()
  try {
    state.processing = true
    await autoLogin()
    await processPage(router.currentRoute.value.name)
    await fetchUserProfile()
    await fetchNotifications("new")
  } finally {
    state.mounted = true
    state.processing = false
  }
})

const router = useRouter()

router.beforeEach(() => {
  state.currentFeeds?.splice(0)
  state.currentCursor = null
})

router.afterEach(async (to: RouteLocationNormalized) => {
  // ページフォワード時はページトップへスクロール
  if (window.history.state.forward == null) {
    window.scrollTo(0, 0)
  }

  state.currentQuery = router.currentRoute.value.query
  // Timeline の取得はログイン後 or カーソルボタン押下時 or timelineFeeds が空の時のみ
  if (to.name === "timeline" && state.timelineFeeds.length > 0) return

  state.processing = true
  try {
    await processPage(to.name)
  } finally {
    state.processing = false
  }
})

async function autoLogin () {
  if (state.hasLogin) return
  if (state.atp.canLogin()) state.hasLogin = await state.atp.login()
}

async function manualLogin (service: string, identifier: string, password: string) {
  try {
    state.processing = true
    state.hasLogin = await state.atp.login(service, identifier, password)
    if (!state.hasLogin) throw new Error("Login failed")
    await processPage(router.currentRoute.value.name)
    await fetchUserProfile()
  } finally {
    state.processing = false
  }
}

async function processPage (pageName?: null | RouteRecordName) {
  switch (pageName) {
    case "profile-post": {
      const handle = state.currentQuery.handle as LocationQueryValue
      if (!handle) {
        await router.push({ name: "timeline" })
        break
      }
      const tasks: Array<Promise<void>> = [fetchCurrentAuthorFeed("new")]
      if (handle !== state.currentProfile?.handle)
       tasks.push(fetchCurrentProfile(handle))
      await Promise.all(tasks)
      break
    }
    case "profile-following": {
      const handle = state.currentQuery.handle as LocationQueryValue
      if (!handle) {
        await router.push({ name: "timeline" })
        break
      }
      state.currentUsers = null
      const tasks: Array<Promise<void>> = [fetchFollowings(handle)]
      if (handle !== state.currentProfile?.handle)
       tasks.push(fetchCurrentProfile(handle))
      await Promise.all(tasks)
      break
    }
    case "profile-follower": {
      const handle = state.currentQuery.handle as LocationQueryValue
      if (!handle) {
        await router.push({ name: "timeline" })
        break
      }
      state.currentUsers = null
      const tasks: Array<Promise<void>> = [fetchFollowers(handle)]
      if (handle !== state.currentProfile?.handle)
       tasks.push(fetchCurrentProfile(handle))
      await Promise.all(tasks)
      break
    }
    case "timeline": {
      await fetchTimeline("new")
      break
    }
    case "post": {
      const uri = state.currentQuery.uri as LocationQueryValue
      if (!uri) {
        await router.push({ name: "timeline" })
        break
      }
      state.currentFeeds?.splice(0)
      state.currentFeeds = await state.atp.fetchPostThread(uri)
      break
    }
  }
}

async function fetchTimeline (direction: "old" | "new") {
  const result: null | { feeds: Array<Feed>; cursor?: string } =
    await state.atp.fetchTimeline(
      state.timelineFeeds,
      20,
      direction === "old" ? state.timelineCursor : undefined
    )
  if (result == null) return
  state.timelineFeeds = result.feeds
  state.timelineCursor = result.cursor
}

async function fetchUserProfile () {
  state.userProfile = await state.atp.fetchProfile(state.atp.session?.handle)
}

async function updateUserProfile (profile: UpdateProfileParams) {
  state.processing = true
  try {
    await state.atp.updateProfile(profile)
  } finally {
    state.processing = false
  }
}

async function fetchCurrentProfile (handle: string) {
  state.currentProfile = null
  state.currentProfile = await state.atp.fetchProfile(handle)
  if (handle === state.atp.session?.handle) {
    state.userProfile = state.currentProfile
  }
}

async function fetchCurrentAuthorFeed (direction: "new" | "old") {
  const handle = state.currentQuery.handle as LocationQueryValue
  if (!handle) return
  const result: null | { feeds: Array<Feed>; cursor?: string } = await state.atp.fetchAuthorFeed(state.currentFeeds as Array<Feed>, handle, 10, direction === "old" ? state.currentCursor ?? undefined : undefined)
  if (result == null) return
  state.currentFeeds = result.feeds
  state.currentCursor = result.cursor ?? null
}

async function fetchFollowings (handle: string) {
  const response: null | {
    cursor?: string;
    followings: Array<Following>;
  } = await state.atp.fetchFollowings(handle, 50)
  if (response == null) return
  state.currentCursor = response.cursor ?? null
  state.currentUsers = response.followings
}

async function fetchFollowers (handle: string) {
  const response: null | {
    cursor?: string;
    followers: Array<Follower>;
  } = await state.atp.fetchFollowers(handle, 50)
  if (response == null) return
  state.currentCursor = response.cursor ?? null
  state.currentUsers = response.followers
}

async function fetchNotifications (direction: "new" | "old") {
  state.notificationCursor =
    await state.atp.fetchNotifications(state.notifications, 20, direction === "new" ? undefined : state.notificationCursor)
}

async function fetchFeeds (type: string, direction: "new" | "old") {
  state.processing = true
  try {
    switch (type) {
      case "author": {
        await fetchCurrentAuthorFeed(direction)
        break
      }
      case "post": {
        const uri = state.currentQuery.uri as LocationQueryValue
        if (!uri) return
        state.currentFeeds = await state.atp.fetchPostThread(uri)
        break
      }
      case "timeline": {
        await fetchTimeline(direction)
        break
      }
    }
  } finally {
    state.processing = false
  }
}

async function createFollow (did: string, declarationCid: string) {
  state.processing = true
  try {
    await state.atp.createFollow(did, declarationCid)
  } finally {
    state.processing = false
  }
}

async function deleteFollow (uri: string) {
  state.processing = true
  try {
    await state.atp.deleteFollow(uri)
  } finally {
    state.processing = false
  }
}

function openSendPostPopup (type: "post" | "reply" | "repost", post?: any) {
  state.sendPostPopupProps.visibility = true
  state.sendPostPopupProps.type = type
  state.sendPostPopupProps.post = post
}

function closeSendPostPopup () {
  state.sendPostPopupProps.visibility = false
}
</script>

<template>
  <div class="main-view">
    <div class="main">
      <div class="left">
        <MainMenu />
      </div>
      <div class="center">
        <RouterView @fetchFeeds="fetchFeeds" />
      </div>
      <div class="right">
        <SubMenu />
      </div>
    </div>
    <SendPostPopup
      v-if="state.sendPostPopupProps.visibility"
      :type="state.sendPostPopupProps.type"
      :post="state.sendPostPopupProps.post"
      @close="closeSendPostPopup"
    />
    <LoginPopup
      v-if="state.mounted && !state.hasLogin"
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
  margin: auto;
  max-width: 1024px;
  min-height: 100vh;
}

.left {
  position: relative;
  min-width: 5rem;
  @media (min-width: 1024px) {
    border-left: 1px solid rgba(var(--fg-color), 0.25);
  }

  & > .main-menu {
    position: fixed;
    top: 0;
  }
}

.center {
  border-left: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: 640px;
  @media (min-width: 1024px) {
    min-width: 640px;
  }
  @media (min-width: calc(640px + 5rem)) {
    border-right: 1px solid rgba(var(--fg-color), 0.25);
  }

  & > .feed-list {
    flex-grow: 1;
  }
}

.right {
  flex-grow: 1;
  @media (max-width: 1024px) {
    display: none;
  }
  @media (min-width: 1024px) {
    border-right: 1px solid rgba(var(--fg-color), 0.25);
  }
}

.loader {
  position: fixed;
}
</style>
