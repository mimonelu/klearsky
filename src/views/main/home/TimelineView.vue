<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/lists/FeedList.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <FeedList
    class="timeline-view"
    type="timeline"
    :feeds="mainState.timelineFeeds"
    :hasLoadButton="true"
  />
</template>

<style lang="scss" scoped>
.timeline-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
