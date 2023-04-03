<script lang="ts" setup>
import { inject } from "vue"
import Post from "@/components/Post.vue"

const mainState = inject("state") as MainState

function updateThisPost (newPosts: Array<TTPost>) {
  const posts = mainState.currentPosts
  if (posts == null) return

  // MEMO: ポストスレッドの全同一ポストに最新のデータを反映する
  posts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) =>
      post?.cid === newPost.cid)
    if (newPost != null) posts[index] = newPost
  })
}

function removeThisPost (uri: string) {
  mainState.currentPosts = mainState.currentPosts.filter((post: TTPost) =>
    post.uri !== uri)
}
</script>

<template>
  <div class="post-view">
    <template v-for="post, postIndex of mainState.currentPosts">
      <Post
        type="post"
        :post="post"
        :data-has-child="post.cid === mainState.currentPosts[postIndex + 1]?.record.reply?.parent?.cid"
        @updateThisPost="updateThisPost"
        @removeThisPost="removeThisPost"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.post {
  &[data-has-child="true"] {
    &::before {
      border-left: 2px solid rgba(var(--fg-color), 0.25);
      content: "";
      display: block;
      position: absolute;
      top: calc(1em + var(--avatar-size) + 8px);
      left: calc(2.5em - 1px);
      width: 0;
      height: calc(100% - var(--avatar-size) - 16px);
    }
  }
}
</style>
