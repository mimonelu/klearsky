<script setup lang="ts">
import { onErrorCaptured, onMounted, provide, reactive } from "vue"
import { useRouter, RouterView } from "vue-router"
import type { LocationQueryValue, RouteLocationNormalized, RouteRecordName } from "vue-router"
import ErrorPopup from "@/components/ErrorPopup.vue"
import Loader from "@/components/Loader.vue"
import LoginPopup from "@/components/LoginPopup.vue"
import MainMenu from "@/components/MainMenu.vue"
import SubMenu from "@/components/SubMenu.vue"
import Atp from "@/composables/atp"
import type { MainState } from "@/@types/app.d"
import type { Feed } from "@/composables/atp"

const router = useRouter()

router.afterEach(async (to: RouteLocationNormalized) => {
  await processPage(to.name)
})

const login = async () => {
  if (state.hasLogin) return
  if (!state.atp.createAgent()) return
  if (state.atp.canLogin()) state.hasLogin = await state.atp.login()
}

const processPage = async (pageName?: null | RouteRecordName) => {
  state.processing = true
  switch (pageName) {
    case "timeline": break
    case "post": {
      const uri = router.currentRoute.value.query.uri as LocationQueryValue
      if (uri == null) {
        await router.push({ name: "timeline" })
        break
      }
      state.pageFeeds?.splice(0)
      state.pageFeeds = await state.atp.fetchPost(uri)
      break
    }
  }
  state.processing = false
}

const fetchTimeline = async (direction: "old" | "new") => {
  if (state.processing) return
  state.processing = true
  try {
    const result: null | { feeds: Array<Feed>; cursor?: string } = await state.atp.fetchFeeds(
      "timeline",
      10,
      state.timelineFeeds,
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
  await processPage(type)
}

const closeErrorPopup = () => {
  state.error = null
}

const state = reactive<MainState>({
  atp: new Atp(),
  mounted: false,
  hasLogin: false,
  error: null,
  timelineFeeds: [],
  timelineCursor: undefined,
  pageFeeds: null,
  fetchFeeds,
  processing: false,
})

provide("state", state)

onErrorCaptured((error: any) => {
  state.error = error
})

onMounted(async () => {
  state.hasLogin = state.atp.hasLogin()
  await login()
  await processPage(router.currentRoute.value.name)
  await fetchTimeline("new")
  state.mounted = true
})
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
    <LoginPopup v-if="state.mounted && !state.hasLogin" />
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
</style>
