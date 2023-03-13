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
import Atp from "@/composables/atp"

const state = reactive<MainState>({
  atp: new Atp(),
  mounted: false,
  hasLogin: false,
  timelineFeeds: [],
  timelineCursor: undefined,
  userProfile: null,
  currentProfile: null,
  pageFeeds: null,
  pageCursor: null,
  fetchFeeds,
  fetchUserProfile,
  fetchCurrentProfile,
  fetchCurrentAuthorFeed,
  updateUserProfile,
  isUserProfile: false,
  query: {},
  processing: false,
  openSendPostPopup,
  sendPostPopupProps: {
    visibility: false,
    type: "",
    post: null,
  },
})

provide("state", state)

onMounted(async () => {
  state.hasLogin = state.atp.hasLogin()
  try {
    state.processing = true
    await autoLogin()
    await processPage(router.currentRoute.value.name)
    await fetchUserProfile()
  } finally {
    state.mounted = true
    state.processing = false
  }
})

const router = useRouter()

router.beforeEach(() => {
  state.currentProfile = null
  state.pageFeeds?.splice(0)
  state.pageCursor = null
})

router.afterEach(async (to: RouteLocationNormalized) => {
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
  state.atp.setService()
  if (!state.atp.createAgent()) return
  if (state.atp.canLogin()) state.hasLogin = await state.atp.login()
}

async function manualLogin (identifier: string, password: string) {
  try {
    state.processing = true
    state.hasLogin = await state.atp.login(identifier, password)
    if (!state.hasLogin) throw new Error("Login failed")
    await processPage(router.currentRoute.value.name)
    await fetchUserProfile()
  } finally {
    state.processing = false
  }
}

async function processPage (pageName?: null | RouteRecordName) {
  state.query = router.currentRoute.value.query
  const handle = state.query.handle as LocationQueryValue
  state.isUserProfile = handle === state.atp.session?.handle

  switch (pageName) {
    case "profile": {
      const handle = state.query.handle as LocationQueryValue
      if (!handle) {
        await router.push({ name: "timeline" })
        break
      }
      await Promise.all([
        fetchCurrentProfile(),
        fetchCurrentAuthorFeed("new")
      ])
      break
    }
    case "timeline": {
      await fetchTimeline("new")
      break
    }
    case "post": {
      const uri = state.query.uri as LocationQueryValue
      if (!uri) {
        await router.push({ name: "timeline" })
        break
      }
      state.pageFeeds?.splice(0)
      state.pageFeeds = await state.atp.fetchPostThread(uri)
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

async function updateUserProfile (profile: any) {
  state.processing = true
  try {
    await state.atp.updateProfile(profile)
  } finally {
    state.processing = false
  }
}

async function fetchCurrentProfile () {
  const handle = state.query.handle as LocationQueryValue
  if (!handle) return
  state.currentProfile = await state.atp.fetchProfile(handle)
  if (handle === state.atp.session?.handle) {
    state.userProfile = state.currentProfile
  }
}

async function fetchCurrentAuthorFeed (direction: "new" | "old") {
  const handle = state.query.handle as LocationQueryValue
  if (!handle) return
  const result: null | { feeds: Array<Feed>; cursor?: string } = await state.atp.fetchAuthorFeed(state.pageFeeds, handle, 10, direction === "old" ? state.pageCursor : undefined)
  if (result == null) return
  state.pageFeeds = result.feeds
  state.pageCursor = result.cursor ?? null
}

async function fetchFeeds (type: string, direction: "new" | "old") {
  state.processing = true
  try {
    switch (type) {
      case "author":
      case "profile": {
        await fetchCurrentAuthorFeed(direction)
        break
      }
      case "timeline": {
        await fetchTimeline(direction)
        break
      }
      case "post": {
        const uri = state.query.uri as LocationQueryValue
        if (!uri) return
        state.pageFeeds = await state.atp.fetchPostThread(uri)
        break
      }
    }
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
  <div class="page">
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
.page {
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
