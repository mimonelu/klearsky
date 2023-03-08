<script lang="ts" setup>
import { inject, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import type { LocationQueryValue } from "vue-router"
import FeedList from "@/components/FeedList.vue"
import { waitProp } from "@/composables/misc"
import type { MainState } from "@/@types/app.d"
import type { Feed } from "@/composables/atp"

const emit = defineEmits<{(event: string, value: any): void}>()

const mainState: MainState = inject("state") as MainState

const state = reactive<{
  feeds: Array<Feed>;
}>({
  feeds: [],
})

const feedList = ref()

const router = useRouter()

const mounted = async () => {
  if (!mainState.hasLogin) await waitProp(() => mainState.hasLogin, true)
  const uri: LocationQueryValue | LocationQueryValue[] = router.currentRoute.value.query.uri
  if (uri == null) {
    await router.push({ name: "timeline" })
    return
  }
  feedList.value?.fetchPost(state.feeds, uri)
}

const updateFeeds = (feeds: Array<Feed>) => {
  state.feeds = feeds
}

watch(() => router.currentRoute.value.fullPath, async () => {
  await mounted()
})

onMounted(mounted)
</script>

<template>
  <div class="timeline">
    <FeedList
      ref="feedList"
      type="post"
      :feeds="state.feeds"
      :hasFetchButton="false"
      @updateFeeds="updateFeeds"
    />
  </div>
</template>

<style lang="scss" scoped>
.feed-list:deep {
  .feed:first-child {
    background-color: rgba(var(--notice-color), 0.125);
  }
}
</style>
