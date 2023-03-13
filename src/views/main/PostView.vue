<script lang="ts" setup>
import { inject } from "vue"
import FeedThread from "@/components/FeedThread.vue"

const mainState: MainState = inject("state") as MainState
</script>

<template>
  <div class="post-view">
    <FeedThread :feeds="mainState.pageFeeds" />
  </div>
</template>
