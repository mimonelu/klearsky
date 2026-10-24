<script lang="ts" setup>
import { computed, inject, reactive } from "vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/ScrollObserver.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

// 追加読み込み中フラグ
// 初回の読み込み中は `mainState.listLoaderDisplay` （ `processPage()` が管理）
const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

// 初回の読み込み中または追加読み込み中
const listLoading = computed((): boolean => {
  return mainState.listLoaderDisplay || state.processing
})

async function fetchAuthorFeedGenerators (direction: "new" | "old") {
  Util.blurElement()
  state.processing = true
  await mainState.fetchCurrentAuthorFeedGenerators(direction)
  state.processing = false
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !listLoading.value
  ) {
    fetchAuthorFeedGenerators("old")
  }
}
</script>

<template>
  <div class="author-feed-generators-view">
    <LoadButton
      direction="new"
      :processing="listLoading"
      @activate="fetchAuthorFeedGenerators('new')"
    />

    <!-- 空のコンテンツメッセージ -->
    <div
      v-if="!listLoading && mainState.currentAuthorFeedGenerators?.length === 0"
      class="textlabel margin1"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noAuthorFeeds") }}
      </div>
    </div>

    <div class="feed-card-container">
      <FeedCard
        v-for="generator of mainState.currentAuthorFeedGenerators"
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
      :processing="listLoading"
      @activate="fetchAuthorFeedGenerators('old')"
    />

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.author-feed-generators-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed-card-container {
  flex-grow: 1;
}
</style>
