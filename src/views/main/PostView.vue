<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/FeedList.vue"

const mainState: MainState = inject("state") as MainState
</script>

<template>
  <div class="post-view">
    <FeedList
      type="post"
      :feeds="mainState.pageFeeds"
      :hasFetchButton="false"
    />
  </div>
</template>

<style lang="scss" scoped>
.feed-list:deep() {
  .feed:first-child {
    background-color: rgba(var(--fg-color), 0.0625);
  }
}
</style>
