<script lang="ts" setup>
import { computed, inject, onBeforeMount, reactive, ref, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  postContainer: ComputedRef<undefined | HTMLElement>
}>({
  processing: false,
  postContainer: computed((): undefined | HTMLElement => {
    return postContainer.value?.closest(".popup-body") ?? undefined
  }),
})

const postContainer = ref()

onBeforeMount(async () => {
  if (mainState.currentPostBookmarkPosts.length === 0) {
    await fetchContinuousResults("new")
  }
})

function close () {
  emit("close")
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) {
    return
  }
  state.processing = true
  const cursor = await mainState.atp.fetchPostBookmarks(
    mainState.currentPostBookmarkPosts,
    mainState.atp.session!.did,
    CONSTS.LIMIT_OF_FETCH_POST_BOOKMARKS,
    direction === "old" ? mainState.currentPostBookmarkPostsCursor : undefined
  )
  state.processing = false
  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "PostBookmarkPopup/fetchContinuousResults")
    return
  }
  if (cursor != null && (
    direction === "old" || (
      direction === "new" &&
      mainState.currentPostBookmarkPostsCursor == null
    )
  )) {
    mainState.currentPostBookmarkPostsCursor = cursor
  }

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("postBookmarkPosts", mainState.currentPostBookmarkPosts)
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.currentPostBookmarkPosts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => {
      return post.cid === newPost.cid
    })
    if (newPost != null) {
      Util.updatePostProps(mainState.currentPostBookmarkPosts[index], newPost)
    }
  })
}

function removeThisPost (uri: string) {
  mainState.currentPostBookmarkPosts = mainState.currentPostBookmarkPosts
    .filter((post: TTPost) => {
      return post.uri !== uri
    })
}
</script>

<template>
  <Popup
    class="post-bookmark-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="bookmark" />
        <span>{{ $t("postBookmark") }}</span>
      </h2>
    </template>
    <template #header-after>
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
    </template>
    <template #body>
      <div
        class="post-bookmark-popup__posts"
        ref="postContainer"
      >
        <Post
          v-for="post of mainState.currentPostBookmarkPosts"
          :key="post.cid"
          position="post"
          :post="post"
          :container="state.postContainer"
          :hasReplyIcon="post.record.reply != null"
          :hasQuoteRepostIcon="post.record.embed?.record != null"
          @click.exact="close"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
          @onActivateHashTag="close"
        />
      </div>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.post-bookmark-popup:deep() {
  .popup {
    flex-grow: 1;

    &-header > h2 > .svg-icon {
      fill: rgb(var(--post-color));
    }

    &-body {
      padding: 0;
    }
  }
}
</style>
