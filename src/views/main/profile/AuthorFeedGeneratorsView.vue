<script lang="ts" setup>
import { inject } from "vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function fetchAuthorFeedGenerators (direction: "new" | "old") {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  await mainState.fetchCurrentAuthorFeedGenerators(direction)
  mainState.listLoaderDisplay = false
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay
  ) {
    fetchAuthorFeedGenerators("old")
  }
}
</script>

<template>
  <div class="author-feed-generators-view">
    <LoadButton
      direction="new"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchAuthorFeedGenerators('new')"
    />

    <!-- 空のコンテンツメッセージ -->
    <div
      v-if="!mainState.listLoaderDisplay && mainState.currentAuthorFeedGenerators?.length === 0"
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
        :creatorDisplay="false"
      />
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listLoaderDisplay"
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
