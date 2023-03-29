<script lang="ts" setup>
import { inject } from "vue"
import Post from "@/components/Post.vue"

const mainState = inject("state") as MainState

const postUri = mainState.currentQuery.postUri as undefined | string

function getPostType (feedIndex: number): "post" | "root" | "parent" | "postInPost" {
  const feeds = mainState.currentFeeds
  if (feeds == null) return "post"
  return feeds.length === 0 || feedIndex === feeds.length - 1
    ? "post"
    : feedIndex === 0
      ? "root"
      : "parent"
}

function updateThisPost (newFeed: TTFeed) {
  const feeds = mainState.currentFeeds
  if (feeds == null) return

  // MEMO: フィード内の全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  feeds?.forEach((feed: TTFeed) => {
    if (feed.post?.cid === newFeed.post.cid) {
      feed.post = newFeed.post
    }
  })
}

function removeThisPost (uri: string) {
  const feeds = mainState.currentFeeds
  feeds?.forEach((feed: TTFeed) => {
    // @ts-ignore // TODO:
    if (feed.post?.uri === uri) delete feed.post
    // @ts-ignore // TODO:
    if (feed.reply?.parent?.uri === uri) delete feed.reply.parent
    // @ts-ignore // TODO:
    if (feed.reply?.root?.uri === uri) delete feed.reply.root
  })
}
</script>

<template>
  <div class="post-view">
    <div class="feed-thread">
      <div
        v-for="feed, feedIndex of mainState.currentFeeds"
        class="feed"
        :data-focus="feed.post?.uri === postUri"
      >
        <Post
          v-if="feed.post != null"
          :type="getPostType(feedIndex)"
          :post="feed.post"
          @updateThisPost="updateThisPost"
          @removeThisPost="removeThisPost"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.feed {
  display: flex;
  flex-direction: column;
  &[data-focus="true"] {
    background-color: rgba(var(--accent-color), 0.125);
  }
}
</style>
