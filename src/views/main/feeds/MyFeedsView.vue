<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/FeedList.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <FeedList
    class="my-feeds-view"
    type="feeds-timeline"
    :feeds="mainState.currentCustomFeeds"
    :hasLoadButton="false"
  />
</template>

<style lang="scss" scoped>
.my-feeds-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed-list:deep() {
  .feed:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  }

  .feed:not(:empty):not(:last-child)::after {
    border-bottom-style: none;
  }
}
</style>
