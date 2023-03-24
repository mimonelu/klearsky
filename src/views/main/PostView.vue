<script lang="ts" setup>
import { inject } from "vue"
import { useRouter } from "vue-router"
import FeedThread from "@/components/FeedThread.vue"

const mainState = inject("state") as MainState

const router = useRouter()
</script>

<template>
  <div class="post-view">
    <FeedThread
      :feeds="mainState.currentFeeds"
      :focusUri="router.currentRoute.value.query.postUri as undefined | string"
    />
  </div>
</template>
