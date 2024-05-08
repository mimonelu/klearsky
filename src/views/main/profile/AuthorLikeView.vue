<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/lists/FeedList.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <FeedList
    type="authorLikes"
    :feeds="mainState.currentAuthorLikes"
    :hasLoadButton="true"
  />
</template>
