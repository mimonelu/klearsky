<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/FeedList.vue"
import type { MainState } from "@/@types/app.d"

const mainState: MainState = inject("state") as MainState
</script>

<template>
  <div class="timeline">
    <FeedList
      type="timeline"
      :feeds="mainState.timelineFeeds"
      :hasFetchButton="true"
    />
  </div>
</template>
