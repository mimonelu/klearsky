<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/FeedList.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <FeedList
    class="feeds-timeline-view"
    type="feeds-timeline"
    :feeds="mainState.currentCustomFeeds"
    :hasLoadButton="true"
  />
</template>

<style lang="scss" scoped>
.feeds-timeline-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed-list:deep() {
  .feeds {
    padding: 0.25em 0;
  }

  .feed {
    border: 1px solid rgba(var(--accent-color), 0.25);
    border-radius: var(--border-radius);
    margin: 0.25em 0.5em;

    &:not(:empty):not(:last-child)::after {
      border-bottom-style: none;
    }
  }
}
</style>
