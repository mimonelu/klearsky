<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import FeedCard from "@/components/app-parts/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

const router = useRouter()

const unwatchOnQuery = watch(() => router.currentRoute.value.query.text, (value: any) => {
  if (value != null) mainState.currentSearchTerm = value
}, { immediate: true })

// インフィニットスクロール
const unwatchOnScroll = watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchContinuousResults("old")
})

onMounted(async () => {
  const textbox = document.getElementById("feed-term-textbox")
  if (textbox != null) textbox.focus()
  if (mainState.currentSearchFeedsLastTerm !== mainState.currentSearchTerm)
    await fetchNewResults()
})

onBeforeUnmount(() => {
  unwatchOnQuery()
  unwatchOnScroll()
})

async function fetchNewResults () {
  if (state.processing) return
  mainState.currentSearchFeedsLastTerm = mainState.currentSearchTerm
  mainState.currentSearchFeeds.splice(0)
  state.processing = true
  await mainState.fetchSearchFeeds("new")
  state.processing = false
  updateRouter()

  // キーワード履歴に保存
  mainState.addKeywordHistory(
    mainState.currentSearchTerm,
    mainState.currentSetting.feedSearchKeywordHistory
  )
  mainState.saveSettings()
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  if (mainState.currentSearchFeedsLastTerm !== mainState.currentSearchTerm) {
    mainState.currentSearchFeedsLastTerm = mainState.currentSearchTerm
    mainState.currentSearchFeeds.splice(0)
    mainState.currentSearchFeedsCursor = undefined
    updateRouter()
  }
  state.processing = true
  await mainState.fetchSearchFeeds(direction)
  state.processing = false
}

function updateRouter () {
  const query = mainState.currentSearchTerm !== ""
    ? { text: mainState.currentSearchTerm }
    : undefined
  router.push({ name: "feed-search", query })
}

function openKeywordHistoryPopover ($event: Event) {
  mainState.openKeywordHistoryPopover(
    $event.target,
    mainState.currentSetting.feedSearchKeywordHistory,
    (keyword: string) => {
      mainState.currentSearchTerm = keyword
      fetchNewResults()
    }
  )
}
</script>

<template>
  <div class="feed-search-view">
    <Portal to="search-view-header">
      <!-- キーワードボックス -->
      <form @submit.prevent="fetchNewResults">
        <input
          v-model="mainState.currentSearchTerm"
          id="feed-term-textbox"
          type="search"
          :placeholder="$t('keyword')"
          autocapitalize="off"
          autocomplete="off"
          inputmode="search"
          spellcheck="false"
          class="textbox"
        >
      </form>

      <!-- キーワード履歴ポップオーバートリガー -->
      <button
        class="button--bordered"
        type="button"
        @click.prevent="openKeywordHistoryPopover"
      >
        <SVGIcon name="history" />
      </button>
    </Portal>
    <div class="feed-search-view__main">
      <div class="feed-card-container">
        <FeedCard
          v-for="generator of mainState.currentSearchFeeds"
          :key="generator.cid"
          :generator="generator"
          :menuDisplay="true"
          :orderButtonDisplay="false"
          :creatorDisplay="true"
        />
      </div>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.feed-search-view__main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed-card-container {
  flex-grow: 1;
}

.feed-card:not(:last-child) {
  border-bottom: 1px solid var(--fg-color-0125);
}
</style>
