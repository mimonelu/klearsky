<script lang="ts" setup>
import Post from "@/components/Post.vue"

const props = defineProps<{
  feeds: null | Array<TTFeed>;
  postUri?: string;
}>()

function getPostType (feedIndex: number): "post" | "root" | "parent" | "postInPost" {
  if (props.feeds == null) return "post"
  return props.feeds.length === 0 || feedIndex === props.feeds.length - 1
    ? "post"
    : feedIndex === 0
      ? "root"
      : "parent"
}

function updateThisPost (newFeed: TTFeed) {
  if (props.feeds == null) return

  // MEMO: フィード内の全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  props.feeds?.forEach((feed: TTFeed) => {
    if (feed.post?.cid === newFeed.post.cid) {
      feed.post = newFeed.post
    }
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
</script>

<template>
  <div class="feed-thread">
    <div
      v-for="feed, feedIndex of feeds"
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
