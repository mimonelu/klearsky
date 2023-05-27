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
</style>
