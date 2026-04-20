<script lang="ts" setup>
import { nextTick, type ComponentPublicInstance } from "vue"
import Post from "@/components/compositions/Post.vue"
import Util from "@/composables/util"

const emit = defineEmits<{
  (event: "clickNotFocused"): void,
  (event: "removeThisPost", uri: string): void,
}>()

const props = defineProps<{
  posts: TTPost[]
  focusPostUri?: string
}>()

// フォーカスポストへのスクロール
async function setFocusPost (el: Element | ComponentPublicInstance | null) {
  if (el != null) {
    await nextTick()
    const element = (el as any)?.$el ?? el
    element.scrollIntoView({
      behavior: "auto",
      block: "start",
    })
  }
}

// ポストの更新
function updateThisPostThread (newPosts: Array<TTPost>) {
  if (props.posts == null) {
    return
  }

  // MEMO: ポストスレッドの全同一ポストに最新のデータを反映する
  props.posts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => {
      return post?.uri === newPost.uri
    })
    if (newPost != null) {
      Util.updatePostProps(props.posts[index], newPost)
    }
  })
}

function onClick (post: TTPost) {
  if (post.uri !== props.focusPostUri) {
    emit("clickNotFocused")
  }
}
</script>

<template>
  <Post
    v-for="post, postIndex of posts"
    :key="post.uri"
    :ref="post.uri === focusPostUri ? setFocusPost : undefined"
    position="post"
    :post="post"
    :focusPostUri="focusPostUri"
    :data-has-child="post.uri === posts[postIndex + 1]?.record.reply?.parent?.uri"
    @click.exact="onClick(post)"
    @updateThisPostThread="updateThisPostThread as unknown"
    @removeThisPost="emit('removeThisPost', post.uri)"
  />
</template>

<style lang="scss" scoped>
// フォーカスポスト
.post[data-focus="true"]:not([data-position="preview"]) {
  background-color: rgb(var(--accent-color), 0.125);
  scroll-margin: 3.25rem;

  &:deep() {
    // フォーカスポスト - フォントサイズの拡大
    .text:not([data-is-text-only-emoji="true"]) {
      font-size: 1.125em;
    }

    // フォーカスポスト - テキスト選択の有効化
    & > .body > .post__content > .html-text {
      user-select: text;
    }
  }
}
</style>
