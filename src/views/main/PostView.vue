<script lang="ts" setup>
import { computed, inject } from "vue"
import Loader from "@/components/shells/Loader.vue"
import PageHeader from "@/components/shells/PageHeader.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const rootPost = computed((): undefined | TTPost => {
  return mainState.currentPosts[0]
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
  if (rootPost.value?.uri == null) {
    return
  }
  mainState.centerLoaderDisplay = true
  const response = rootPost.value?.viewer?.threadMuted
    ? await mainState.atp.updateThreadMuteToDisable(rootPost.value?.uri)
    : await mainState.atp.updateThreadMuteToEnable(rootPost.value?.uri)
  mainState.centerLoaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "PostView/toggleThreadMute")
    return
  }
  if (rootPost.value.viewer != null) {
    rootPost.value.viewer.threadMuted = !rootPost.value.viewer.threadMuted
  }
}

// スレッドソート
const sortModes = [
  "oldest",
  "newest",
  "most-likes",
  "hotness",
] as const

function getThreadViewPref (): TTPreferenceThreadView | undefined {
  return mainState.currentPreferences.find((pref) => {
    return pref.$type === "app.bsky.actor.defs#threadViewPref"
  }) as TTPreferenceThreadView | undefined
}

async function toggleSort () {
  Util.blurElement()
  const currentPref = getThreadViewPref()
  const currentSort = currentPref?.sort ?? "oldest"
  const currentIndex = sortModes.indexOf(currentSort)
  const nextIndex = (currentIndex + 1) % sortModes.length
  const nextSort = sortModes[nextIndex]

  // Preference を更新
  if (currentPref != null) {
    currentPref.sort = nextSort
  } else {
    mainState.currentPreferences.push({
      $type: "app.bsky.actor.defs#threadViewPref",
      sort: nextSort,
    })
  }

  mainState.centerLoaderDisplay = true
  const success = await mainState.updatePreferences()
  if (success) {
    await mainState.fetchPostThread()
  }
  mainState.centerLoaderDisplay = false
}
</script>

<template>
  <div class="post-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('post')"
        :subTitle="rootPost?.author.displayName ?? ''"
      >
        <template #right>
          <!-- 再取得ボタン -->
          <button @click.stop="updateAll">
            <SVGIcon name="refresh" />
          </button>

          <!-- スレッドミュートトグル -->
          <button
            class="post-view__thread-mute-toggle"
            :data-enable="rootPost?.viewer?.threadMuted"
            @click.stop="toggleThreadMute"
          >
            <SVGIcon :name="rootPost?.viewer?.threadMuted ? 'volumeOff' : 'volumeOn'" />
          </button>

          <!-- ポストソートボタン -->
          <button
            class="post-view__sort-button"
            @click.stop="toggleSort"
          >
            <SVGIcon name="sort" />
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
      @updateThisPostThread="updateThisPostThread as unknown"
      @removeThisPost="removeThisPost as unknown"
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
