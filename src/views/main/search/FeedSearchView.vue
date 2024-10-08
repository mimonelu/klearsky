<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import FeedCard from "@/components/cards/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  mode: "popular" | "related"
}>({
  processing: false,
  mode: "popular",
})

const router = useRouter()

const unwatchOnQuery = watch(() => router.currentRoute.value.query.text, (value: any) => {
  if (value != null) mainState.currentSearchTerm = value
}, { immediate: true })

onMounted(async () => {
  const textbox = document.getElementById("feed-term-textbox")
  if (textbox != null) textbox.focus()
  if (mainState.currentSearchFeedsLastTerm !== mainState.currentSearchTerm)
    await fetchNewResults()
})

onBeforeUnmount(() => {
  unwatchOnQuery()
})

async function fetchNewResults () {
  if (state.processing) return
  mainState.currentSearchFeedsLastTerm = mainState.currentSearchTerm
  mainState.currentSearchFeeds.splice(0)
  state.processing = true
  await mainState.fetchSearchFeeds("new")
  state.processing = false
  state.mode = mainState.currentSearchTerm === "" ? "popular" : "related"
  updateRouter()
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

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !state.processing
  ) {
    fetchContinuousResults("old")
  }
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
          :placeholder="$t('feedSearch')"
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
      <div
        v-if="state.mode === 'popular' && !state.processing"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="feed" />{{ $t("popularFeeds") }}
        </div>
      </div>
      <div class="feed-card-container">
        <FeedCard
          v-for="generator of mainState.currentSearchFeeds"
          :key="generator.uri"
          :generator="generator"
          :menuDisplay="true"
          :detailDisplay="true"
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

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.feed-search-view {
  .textlabel {
    margin-top: 0.5rem;
    padding-left: 1rem;
  }

  &__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
}

.feed-card-container {
  flex-grow: 1;
}
</style>
