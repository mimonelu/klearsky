<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Loader from "@/components/shells/Loader.vue"
import PageHeader from "@/components/shells/PageHeader.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  rootPost: ComputedRef<undefined | TTPost>
}>({
  rootPost: computed((): undefined | TTPost => {
    return mainState.currentPosts[0]
  }),
})

// ポストの更新
function updateThisPostThread (newPosts: Array<TTPost>) {
  if (mainState.currentPosts == null) {
    return
  }

  // MEMO: ポストスレッドの全同一ポストに最新のデータを反映する
  mainState.currentPosts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => {
      return post?.uri === newPost.uri
    })
    if (newPost != null) {
      Util.updatePostProps(mainState.currentPosts[index], newPost)
    }
  })
}

// ポストの削除
function removeThisPost (uri: string) {
  mainState.currentPosts = mainState.currentPosts.filter((post: TTPost) => {
    return post.uri !== uri
  })
}

// 再取得
async function updateAll () {
  Util.blurElement()
  mainState.centerLoaderDisplay = true
  await mainState.fetchPostThread()
  mainState.centerLoaderDisplay = false
}

// スレッドミュートのトグル
async function toggleThreadMute () {
  Util.blurElement()
  if (state.rootPost?.uri == null) {
    return
  }
  mainState.centerLoaderDisplay = true
  const response = state.rootPost?.viewer?.threadMuted
    ? await mainState.atp.updateThreadMuteToDisable(state.rootPost?.uri)
    : await mainState.atp.updateThreadMuteToEnable(state.rootPost?.uri)
  mainState.centerLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "PostView/toggleThreadMute")
    return
  }
  if (state.rootPost.viewer != null) {
    state.rootPost.viewer.threadMuted = !state.rootPost.viewer.threadMuted
  }
}
</script>

<template>
  <div class="post-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('post')"
        :subTitle="state.rootPost?.author.displayName ?? ''"
      >
        <template #right>
          <!-- 再取得ボタン -->
          <button @click.stop="updateAll">
            <SVGIcon name="refresh" />
          </button>

          <!-- スレッドミュートトグル -->
          <button
            class="post-view__thread-mute-toggle"
            :data-enable="state.rootPost?.viewer?.threadMuted"
            @click.stop="toggleThreadMute"
          >
            <SVGIcon :name="state.rootPost?.viewer?.threadMuted ? 'volumeOff' : 'volumeOn'" />
          </button>
        </template>
      </PageHeader>
    </Portal>
    <Post
      v-for="post, postIndex of mainState.currentPosts"
      :key="post.uri"
      position="post"
      :post="post"
      :data-has-child="post.uri === mainState.currentPosts[postIndex + 1]?.record.reply?.parent?.uri"
      @updateThisPostThread="updateThisPostThread"
      @removeThisPost="removeThisPost"
    />
    <Loader v-if="mainState.listLoaderDisplay" />
  </div>
</template>

<style lang="scss" scoped>
.post-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-bottom: var(--sp-menu-height);
  position: relative;

  // スレッドミュートトグル
  &__thread-mute-toggle[data-enable="true"] {
    --fg-color: var(--notice-color);
  }
}

// フォーカスポスト
.post[data-focus="true"]:not([data-position="preview"]) {
  background-color: rgb(var(--accent-color), 0.125);
  scroll-margin: 3.25rem;

  &:deep() {
    // フォーカスポスト - フォントサイズの拡大
    .text {
      font-size: 1.125em;
    }

    // フォーカスポスト - テキスト選択の有効化
    & > .body > .body__right > .post__content > .html-text {
      user-select: text;
    }
  }
}
</style>
