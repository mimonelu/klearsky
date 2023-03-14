<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/FeedList.vue"

const mainState: MainState = inject("state") as MainState
</script>

<template>
  <FeedList
    type="author"
    :feeds="mainState.pageFeeds"
    :hasFetchButton="true"
  />
</template>
