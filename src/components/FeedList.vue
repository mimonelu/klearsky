<script lang="ts" setup>
import { inject, watch } from "vue"
import Feed from "@/components/Feed.vue"
import LoadButton from "@/components/LoadButton.vue"
import Util from "@/composables/util"

const props = defineProps<{
  type: "author" | "authorReposts" | "authorLikes" | "feeds-timeline" | "post" | "timeline";
  feeds: null | Array<TTFeed>;
  hasLoadButton?: boolean;
  disabledInfinitScroll?: boolean;
}>()

const mainState = inject("state") as MainState

async function fetchFeeds (direction: "new" | "old") {
  Util.blurElement()
  mainState.listProcessing = true
  try {
    switch (props.type) {
      case "author": {
        await mainState.fetchCurrentAuthorFeed(direction)
        break
      }
      case "authorReposts": {
        await mainState.fetchAuthorReposts(direction)
        break
      }
      case "authorLikes": {
        await mainState.fetchAuthorLikes(direction)
        break
      }
      case "feeds-timeline": {
        await mainState.fetchCustomFeeds(direction)
        break
      }
      case "post": {
        await mainState.fetchPostThread()
        break
      }
      case "timeline": {
        await mainState.fetchTimeline(direction)
        break
      }
    }
  } finally {
    mainState.listProcessing = false
  }
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  if (props.feeds == null) return

  // MEMO: フィード内の全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  props.feeds.forEach((feed: TTFeed) => {
    newPosts.forEach((newPost: TTPost) => {
      if (feed.post?.cid === newPost.cid) {
        feed.post = newPost
      }
      if (feed.reply?.parent?.cid === newPost.cid) {
        feed.reply.parent = newPost
      }
      if (feed.reply?.root?.cid === newPost.cid) {
        feed.reply.root = newPost
      }
    })
  })
}

function removeThisPost (uri: string) {
  props.feeds?.forEach((feed: TTFeed) => {
    // @ts-ignore // TODO:
    if (feed.post?.uri === uri) delete feed.post
    // @ts-ignore // TODO:
    if (feed.reply?.parent?.uri === uri) delete feed.reply.parent
    // @ts-ignore // TODO:
    if (feed.reply?.root?.uri === uri) delete feed.reply.root
  })
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (!props.disabledInfinitScroll && value) fetchFeeds("old")
})
</script>

<template>
  <div class="feed-list">
    <LoadButton
      v-if="hasLoadButton"
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchFeeds('new')"
    />
    <div class="feeds">
      <Feed
        v-for="feed of feeds"
        :key="feed.__id"
        :feed="feed"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
      />
    </div>
    <LoadButton
      v-if="hasLoadButton"
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchFeeds('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.feed-list {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feeds {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed {
  display: flex;
  flex-direction: column;
  &:not(:empty):not(:last-child)::after {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
    content: "";
    display: block;
  }
}
</style>
