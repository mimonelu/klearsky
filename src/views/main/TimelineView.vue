<script lang="ts" setup>
import { inject, onMounted, reactive, ref } from "vue"
import FeedList from "@/components/FeedList.vue"
import { waitProp } from "@/composables/misc"
import type { MainState } from "@/@types/app.d"
import type { Feed } from "@/composables/atp"

const emit = defineEmits<{(event: string, value: any): void}>()

const mainState: MainState = inject("state") as MainState

const feedList = ref()

const updateFeeds = (result: null | { feeds: Array<Feed>; cursor?: string }) => {
  emit("updateFeeds", result)
}

onMounted(async () => {
  if (!mainState.hasLogin) await waitProp(() => mainState.hasLogin, true)
  feedList.value?.fetchFeeds(mainState.timelineFeeds, "new")
})
</script>

<template>
  <div class="timeline">
    <FeedList
      ref="feedList"
      type="timeline"
      :feeds="mainState.timelineFeeds"
      :cursor="mainState.timelineCursor"
      :limit="10"
      @updateFeeds="updateFeeds"
    />
  </div>
</template>
