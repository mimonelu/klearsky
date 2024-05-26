<script lang="ts" setup>
import { inject, watch } from "vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function fetchAuthorFeedGenerators (direction: "new" | "old") {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  await mainState.fetchCurrentAuthorFeedGenerators(direction)
  mainState.listLoaderDisplay = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchAuthorFeedGenerators("old")
})
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
        :key="generator.cid"
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
