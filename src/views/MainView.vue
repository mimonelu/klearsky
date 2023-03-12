<script setup lang="ts">
import { onErrorCaptured, onMounted, provide, reactive } from "vue"
import { useRouter, RouterView } from "vue-router"
import type { LocationQueryValue, RouteLocationNormalized, RouteRecordName } from "vue-router"
import ErrorPopup from "@/components/ErrorPopup.vue"
import Loader from "@/components/Loader.vue"
import LoginPopup from "@/components/LoginPopup.vue"
import MainMenu from "@/components/MainMenu.vue"
import SendPostPopup from "@/components/SendPostPopup.vue"
import SubMenu from "@/components/SubMenu.vue"
import Atp from "@/composables/atp"
import type { MainState } from "@/@types/app.d"
import type { Feed } from "@/composables/atp"

onMounted(async () => {
  state.hasLogin = state.atp.hasLogin()
  try {
    state.processing = true
    await autoLogin()
    await processPage(router.currentRoute.value.name)
    await fetchUserProfile()
    state.processing = false
    await fetchTimeline("new")
  } finally {
    state.mounted = true
    state.processing = false
  }
})

onErrorCaptured((error: any) => {
  state.error = error
})

const router = useRouter()

router.afterEach(async (to: RouteLocationNormalized) => {
  state.processing = true
  try {
    await processPage(to.name)
  } finally {
    state.processing = false
  }
})

const autoLogin = async () => {
  if (state.hasLogin) return
  state.atp.setService()
  if (!state.atp.createAgent()) return
  if (state.atp.canLogin()) state.hasLogin = await state.atp.login()
}

const manualLogin = async (identifier: string, password: string) => {
  try {
    state.processing = true
    state.hasLogin = await state.atp.login(identifier, password)
    if (!state.hasLogin) throw new Error("Login failed")
    await processPage(router.currentRoute.value.name)
    await fetchUserProfile()
    state.processing = false
    await fetchTimeline("new")
  } finally {
    state.processing = false
  }
}

const processPage = async (pageName?: null | RouteRecordName) => {
  state.query = router.currentRoute.value.query
  const did = state.query.did as LocationQueryValue
  state.isUserProfile = did === state.atp.session?.did

  switch (pageName) {
    case "profile": {
      const did = state.query.did as LocationQueryValue
      if (!did) {
        await router.push({ name: "timeline" })
        break
      }
      await Promise.all([
        fetchCurrentProfile(),
        fetchCurrentAuthorFeed()
      ])
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

const fetchUserProfile = async () => {
  state.userProfile = await state.atp.fetchProfile(state.atp.session?.did)
}

const fetchCurrentProfile = async () => {
  const did = state.query.did as LocationQueryValue
  if (!did) return
  state.currentProfile = null
  state.currentProfile = await state.atp.fetchProfile(did)
  if (did === state.atp.session?.did) {
    state.userProfile = state.currentProfile
  }
}

const fetchCurrentAuthorFeed = async () => {
  const did = state.query.did as LocationQueryValue
  if (!did) return
  state.pageFeeds?.splice(0)
  const result: null | { feeds: Array<Feed>; cursor?: string } = await state.atp.fetchAuthorFeed(state.pageFeeds, did, 10)
  if (result == null) return
  state.pageFeeds = result.feeds
  state.pageCursor = result.cursor
}

const fetchTimeline = async (direction: "old" | "new") => {
  if (state.processing) return
  state.processing = true
  try {
    const result: null | { feeds: Array<Feed>; cursor?: string } = await state.atp.fetchTimeline(
      state.timelineFeeds,
      20,
      direction === "old" ? state.timelineCursor : undefined
    )
    if (result == null) return
    state.timelineFeeds = result.feeds
    state.timelineCursor = result.cursor
  } finally {
    state.processing = false
  }
}

const fetchFeeds = async (type: string, direction: "new" | "old") => {
  if (type === "timeline") {
    await fetchTimeline(direction)
    return
  }
  state.processing = true
  try {
    await processPage(type)
  } finally {
    state.processing = false
  }
}

const updateProfile = async (profile: any) => {
  state.processing = true
  try {
    await state.atp.updateProfile(profile)
  } finally {
    state.processing = false
  }
}

const closeErrorPopup = () => {
  state.error = null
}

const openSendPostPopup = (type: "post" | "reply" | "repost", post?: any) => {
  state.sendPostPopupProps.visibility = true
  state.sendPostPopupProps.type = type
  state.sendPostPopupProps.post = post
}

const closeSendPostPopup = () => {
  state.sendPostPopupProps.visibility = false
}

const state = reactive<MainState>({
  atp: new Atp(),
  mounted: false,
  hasLogin: false,
  error: null,
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
  updateProfile,
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
    <ErrorPopup
      v-if="state.mounted && state.error != null"
      @close="closeErrorPopup"
    />
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
