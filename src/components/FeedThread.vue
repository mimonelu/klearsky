<script lang="ts" setup>
import Post from "@/components/Post.vue"

const props = defineProps<{
  feeds: null | Array<Feed>;
}>()

function getType (feedIndex: number): string {
  if (props.feeds == null) return "post"
  return props.feeds.length === 0 || feedIndex === props.feeds.length - 1
    ? "post"
    : feedIndex === 0
      ? 'root'
      : 'parent'
}

// TODO: 不要であれば削除すること
function updatePost (newFeed: Feed) {
  if (props.feeds == null) return

  // MEMO: フィード内の全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  props.feeds?.forEach((feed: Feed) => {
    if (feed.post?.cid === newFeed.post.cid) {
      feed.post = newFeed.post
    }
  })
}
</script>

<template>
  <div class="feed-thread">
    <div
      v-for="feed, feedIndex of props.feeds"
      class="feed"
    >
      <Post
        :type="getType(feedIndex)"
        :post="feed.post"
        @update="updatePost"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.feed {
  display: flex;
  flex-direction: column;
  &:first-child {
    background-color: rgba(var(--fg-color), 0.0625);
  }
}
</style>
