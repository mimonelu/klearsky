<script lang="ts" setup>
import { computed, inject, reactive } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import MediaList from "@/components/next/MediaList/MediaList.vue"
import ScrollObserver from "@/components/next/ScrollObserver/ScrollObserver.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

// 追加読み込み中フラグ
// 初回の読み込み中は `mainState.listLoaderDisplay` （ `processPage()` が管理）
const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

// 初回の読み込み中または追加読み込み中
const listLoading = computed((): boolean => {
  return mainState.listLoaderDisplay || state.processing
})

const medias = computed((): Array<TTMediaListItem> => {
  const results: Array<TTMediaListItem> = []
  mainState.currentAuthorFeedsWithMedia.forEach((feed: TTFeed) => {
    if (feed.post.embed?.images == null) return
    feed.post.embed.images.forEach((image: TTImage) => {
      results.push({
        post: feed.post,
        smallUri: image.thumb as string,
        largeUri: image.fullsize as string,
        alt: image.alt,
      })
    })
  })
  return results
})

async function fetchCurrentAuthorFeed (direction: "new" | "old") {
  Util.blurElement()
  state.processing = true
  await mainState.fetchCurrentAuthorFeed(direction, "posts_with_media")
  state.processing = false
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !listLoading.value
  ) {
    fetchCurrentAuthorFeed("old")
  }
}
</script>

<template>
  <div class="author-media-view">
    <LoadButton
      direction="new"
      :processing="listLoading"
      @activate="fetchCurrentAuthorFeed('new')"
    />
    <MediaList
      :did="mainState.currentProfile?.did"
      :medias="medias"
      :processing="listLoading"
    />
    <LoadButton
      direction="old"
      :processing="listLoading"
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
