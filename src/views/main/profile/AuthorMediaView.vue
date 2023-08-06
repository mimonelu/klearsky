<script lang="ts" setup>
import { computed, inject, reactive, watch, type ComputedRef } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import LoadButton from "@/components/LoadButton.vue"
import MediaList from "@/components/MediaList.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  medias: ComputedRef<Array<TTMedia>>
}>({
  medias: computed((): Array<TTMedia> => {
    const results: Array<TTMedia> = []

    // リポストを含むかどうか
    const includeRepost = mainState.currentAuthorMediasIncludeRepost.includes(true)

    mainState.currentAuthorFeeds.forEach((feed: TTFeed) => {
      // メディアがなければ終了
      if (feed.post.embed?.images == null) return

      // リポストかどうか
      const isRepost = (feed.reason?.$type ?? "") === "app.bsky.feed.defs#reasonRepost"

      // リポスト判定
      if (!includeRepost && isRepost) return

      feed.post.embed.images.forEach((image: TTImage) => {
        results.push({
          post: feed.post,
          uri: image.thumb as string,
          alt: image.alt,
          isRepost,
        })
      })
    })
    return results
  }),
})

const easyFormProps: TTEasyForm = {
  data: [
    {
      state: mainState,
      model: "currentAuthorMediasIncludeRepost",
      type: "checkbox",
      options: [{ label: $t("includeRepost"), value: true }],
    },
  ],
}

async function fetchCurrentAuthorFeed (direction: "new" | "old") {
  Util.blurElement()
  mainState.listProcessing = true
  await mainState.fetchCurrentAuthorFeed(direction)
  mainState.listProcessing = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchCurrentAuthorFeed("old")
})
</script>

<template>
  <div class="author-media-view">
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchCurrentAuthorFeed('new')"
    />
    <EasyForm v-bind="easyFormProps" />
    <MediaList :medias="state.medias" />
    <LoadButton
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchCurrentAuthorFeed('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.author-media-view {
  display: flex;
  flex-direction: column;

  &:deep() .easy-form .checkboxes label {
    border-radius: 0;
    border-style: none;
  }
}
</style>
