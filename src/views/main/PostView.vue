<script lang="ts" setup>
import { inject } from "vue"
import Loader from "@/components/Loader.vue"
import PageHeader from "@/components/PageHeader.vue"
import Post from "@/components/Post.vue"

const mainState = inject("state") as MainState

function updateThisPostThread (newPosts: Array<TTPost>) {
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
    <PageHeader
      :title="$t('post')"
      :subTitle="mainState.currentPosts[0] != null ? mainState.currentPosts[0].author.displayName : ''"
    />
    <template
      v-for="post, postIndex of mainState.currentPosts"
      :key="post.cid"
    >
      <Post
        position="post"
        :post="post"
        :data-has-child="post.cid === mainState.currentPosts[postIndex + 1]?.record.reply?.parent?.cid"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
      />
    </template>
    <Loader v-if="mainState.listProcessing" />
  </div>
</template>

<style lang="scss" scoped>
.post-view {
  flex-grow: 1;
  padding-bottom: 8rem;
  position: relative;
}

.page-header {
  position: unset;
}

.post[data-has-child="true"]::before {
  background-color: rgba(var(--fg-color), 0.25);
  content: "";
  display: block;
  position: absolute;
  top: calc(1em + var(--avatar-size) + 8px);
  left: calc(2.5em - 1px);
  width: 2px;
  height: calc(100% - var(--avatar-size) - 16px);
}
</style>
