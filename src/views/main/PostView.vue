<script lang="ts" setup>
import { computed, inject } from "vue"
import Loader from "@/components/shells/Loader.vue"
import PageHeader from "@/components/shells/PageHeader.vue"
import PostThread from "@/components/next/Post/PostThread.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const rootPost = computed((): undefined | TTPost => {
  return mainState.currentPosts[0]
})

function removeThisPost (uri: string) {
  mainState.currentPosts =
    mainState.currentPosts.filter((post: TTPost) => {
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
/*
function getThreadViewPref (): TTPreferenceThreadView | undefined {
  return mainState.currentPreferences.find((pref) => {
    return pref.$type === "app.bsky.actor.defs#threadViewPref"
  }) as TTPreferenceThreadView | undefined
}

function openPostThreadSortPopover ($event: Event) {
  Util.blurElement()
  mainState.postThreadSortPopoverCallback = applySort
  mainState.openPostThreadSortPopover($event.target)
}

async function applySort (sort: "oldest" | "newest" | "most-likes" | "hotness") {
  const currentPref = getThreadViewPref()

  // Preferenceを更新
  if (currentPref != null) {
    currentPref.sort = sort
  } else {
    mainState.currentPreferences.push({
      $type: "app.bsky.actor.defs#threadViewPref",
      sort,
    })
  }

  mainState.centerLoaderDisplay = true
  const success = await mainState.updatePreferences()
  if (success) {
    await mainState.fetchPostThread()
  }
  mainState.centerLoaderDisplay = false
}
*/
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
            <SVGIcon :name="rootPost?.viewer?.threadMuted ? 'bellOff' : 'bell'" />
          </button>

          <!-- TODO: app.bsky.unspecced.getPostThreadV2 が正式実装され次第コメントアウト -->
          <!-- ポストスレッドソートボタン -->
          <!--
          <button
            class="post-view__sort-button"
            @click.stop="openPostThreadSortPopover"
          >
            <SVGIcon name="sort" />
          </button>
          -->
        </template>
      </PageHeader>
    </Portal>
    <PostThread
      :posts="mainState.currentPosts"
      :focusPostUri="mainState.currentQuery.uri"
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

  // ポストスレッドソートボタン
  &__sort-button > .svg-icon {
    pointer-events: none;
  }
}
</style>
