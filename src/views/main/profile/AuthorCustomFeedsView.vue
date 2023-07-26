<script lang="ts" setup>
import { inject, watch } from "vue"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import LoadButton from "@/components/LoadButton.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function fetchAuthorCustomFeeds (direction: "new" | "old") {
  Util.blurElement()
  mainState.listProcessing = true
  await mainState.fetchCurrentAuthorCustomFeeds(direction)
  mainState.listProcessing = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, () => {
  fetchAuthorCustomFeeds("old")
})
</script>

<template>
  <div class="author-custom-feeds-view">
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchAuthorCustomFeeds('new')"
    />
    <div class="custom-feed-container">
      <CustomFeedCard
        v-for="generator of mainState.currentAuthorCustomFeeds"
        :key="generator.cid"
        :generator="generator"
        :orderButtonDisplay="false"
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

.custom-feed-card:not(:last-child) {
  border-bottom: 1px solid rgba(var(--fg-color), 0.125);
}
</style>
