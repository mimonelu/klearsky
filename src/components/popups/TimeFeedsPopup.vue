<script lang="ts" setup>
import { computed, inject, onBeforeMount, reactive, ref, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  postContainer: ComputedRef<undefined | HTMLElement>
}>({
  processing: false,
  postContainer: computed((): undefined | HTMLElement => {
    return postContainer.value?.closest(".popup-body") ?? undefined
  }),
})

const postContainer = ref()

onBeforeMount(async () => {
  await fetchContinuousResults("old")
})

function close () {
  emit("close")
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  if (mainState.timeFeedsPopupProps == null) return
  state.processing = true
  await mainState.atp.fetchTimeFeeds(
    mainState.currentTimeFeeds,
    direction,
    mainState.timeFeedsPopupProps.author,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_FEEDS
  )
  state.processing = false
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.currentTimeFeeds.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => post.cid === newPost.cid)
    if (newPost != null) Util.updatePostProps(mainState.currentTimeFeeds[index], newPost)
  })
}

function removeThisPost (uri: string) {
  mainState.currentTimeFeeds = mainState.currentTimeFeeds
    .filter((post: TTPost) => {
      return post.uri !== uri
    })
}
</script>

<template>
  <Popup
    class="time-feeds-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="history" />
        <span>{{ $t("timeFeeds") }} - {{ mainState.timeFeedsPopupProps?.author?.displayName }}</span>
      </h2>
    </template>
    <template #header-after>
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
    </template>
    <template #body>
      <div
        class="time-feeds-popup__posts"
        ref="postContainer"
      >
        <Post
          v-for="post of mainState.currentTimeFeeds"
          :key="post.cid"
          position="post"
          :post="post"
          :container="state.postContainer"
          :hasReplyIcon="post.record.reply != null"
          :hasQuoteRepostIcon="post.record.embed?.record != null"
          :data-focus="mainState.timeFeedsPopupProps?.uri === post.uri"
          @click="close"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
          @onActivateHashTag="close"
        />
      </div>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.time-feeds-popup:deep() {
  .popup {
    height: 100%;

    &-body {
      padding: 0;
    }
  }
}

.post[data-focus="true"] {
  background-color: var(--accent-color-0125);
}
</style>
