<script lang="ts" setup>
import { inject, onMounted, reactive, watch } from "vue"
import FeedCard from "@/components/FeedCard.vue"
import LoadButton from "@/components/LoadButton.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false
})

onMounted(() => {
  const textbox = document.getElementById("feed-term-textbox")
  if (textbox != null) textbox.focus()

  // 検索キーワードと検索結果がない場合、すべてのフィードを取得
  if (mainState.currentSearchFeedsTerm === "" &&
      mainState.currentSearchFeeds.length === 0)
    fetchNewResults()
})

async function fetchNewResults () {
  if (state.processing) return
  mainState.currentSearchFeedsLastTerm = mainState.currentSearchFeedsTerm
  mainState.currentSearchFeeds.splice(0)
  state.processing = true
  await mainState.fetchSearchFeeds("new")
  state.processing = false
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  if (mainState.currentSearchFeedsLastTerm !== mainState.currentSearchFeedsTerm) {
    mainState.currentSearchFeedsLastTerm = mainState.currentSearchFeedsTerm
    mainState.currentSearchFeeds.splice(0)
    mainState.currentSearchFeedsCursor = undefined
  }
  state.processing = true
  await mainState.fetchSearchFeeds(direction)
  state.processing = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchContinuousResults("old")
})
</script>

<template>
  <div class="feed-search-view">
    <form @submit.prevent="fetchNewResults">
      <input
        v-model="mainState.currentSearchFeedsTerm"
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
    <div class="main">
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
.feed-search-view {
  form {
    display: grid;
    padding: 1rem;
  }
}

.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed-card-container {
  border-top: 1px solid var(--fg-color-025);
  flex-grow: 1;
}

.feed-card:not(:last-child) {
  border-bottom: 1px solid var(--fg-color-0125);
}
</style>
