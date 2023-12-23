<script lang="ts" setup>
import { inject, watch } from "vue"
import FeedCard from "@/components/app-parts/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function fetchAuthorCustomFeeds (direction: "new" | "old") {
  Util.blurElement()
  mainState.listProcessing = true
  await mainState.fetchCurrentAuthorCustomFeeds(direction)
  mainState.listProcessing = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchAuthorCustomFeeds("old")
})
</script>

<template>
  <div class="author-custom-feeds-view">
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchAuthorCustomFeeds('new')"
    />

    <!-- 空のコンテンツメッセージ -->
    <div
      v-if="!mainState.listProcessing && mainState.currentAuthorCustomFeeds?.length === 0"
      class="textlabel margin1"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noAuthorFeeds") }}
      </div>
    </div>

    <div class="feed-card-container">
      <FeedCard
        v-for="generator of mainState.currentAuthorCustomFeeds"
        :key="generator.cid"
        :generator="generator"
        :menuDisplay="true"
        :orderButtonDisplay="false"
        :creatorDisplay="false"
      />
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchAuthorCustomFeeds('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.author-custom-feeds-view {
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
