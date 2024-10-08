<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import MediaList from "@/components/lists/MediaList.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  medias: ComputedRef<Array<TTMedia>>
}>({
  medias: computed((): Array<TTMedia> => {
    const results: Array<TTMedia> = []
    mainState.currentAuthorFeedsWithMedia.forEach((feed: TTFeed) => {
      if (feed.post.embed?.images == null) return
      feed.post.embed.images.forEach((image: TTImage) => {
        results.push({
          post: feed.post,
          uri: image.thumb as string,
          alt: image.alt,
        })
      })
    })
    return results
  }),
})

async function fetchCurrentAuthorFeed (direction: "new" | "old") {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  await mainState.fetchCurrentAuthorFeed(direction, "posts_with_media")
  mainState.listLoaderDisplay = false
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay
  ) {
    fetchCurrentAuthorFeed("old")
  }
}
</script>

<template>
  <div class="author-media-view">
    <LoadButton
      direction="new"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchCurrentAuthorFeed('new')"
    />
    <MediaList :medias="state.medias" />
    <LoadButton
      direction="old"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchCurrentAuthorFeed('old')"
    />

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.author-media-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .media-list {
    flex-grow: 1;
  }
}
</style>
