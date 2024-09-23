<script lang="ts" setup>
import { computed, inject, onBeforeMount, reactive, ref, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

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
  if (mainState.currentCustomBookmarkPosts.length === 0) {
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
  const cursor = await mainState.atp.fetchCustomBookmarks(
    mainState.currentCustomBookmarkPosts,
    mainState.atp.session!.did,
    CONSTS.LIMIT_OF_FETCH_CUSTOM_BOOKMARKS,
    direction === "old" ? mainState.currentCustomBookmarkPostsCursor : undefined
  )
  state.processing = false
  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "customBookmarkPopup/fetchContinuousResults")
    return
  }
  if (cursor != null && (
    direction === "old" || (
      direction === "new" &&
      mainState.currentCustomBookmarkPostsCursor == null
    )
  )) {
    mainState.currentCustomBookmarkPostsCursor = cursor
  }

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("customBookmarkPosts", mainState.currentCustomBookmarkPosts)
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.currentCustomBookmarkPosts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => {
      return post.cid === newPost.cid
    })
    if (newPost != null) {
      Util.updatePostProps(mainState.currentCustomBookmarkPosts[index], newPost)
    }
  })
}

function removeThisPost (uri: string) {
  mainState.currentCustomBookmarkPosts = mainState.currentCustomBookmarkPosts
    .filter((post: TTPost) => {
      return post.uri !== uri
    })
}

async function outputJsonForSkyFeed () {
  Util.blurElement()
  if (!(await mainState.openConfirmationPopup({
    text: $t("customBookmarkOutputConfirmation"),
  }))) {
    return
  }
  const blocks = mainState.currentCustomBookmarkPosts
    .map((post) => {
      return {
        type: "input",
        inputType: "post",
        postUri: post.uri,
      }
    })
    .reverse()
  const jsonObject = {
    displayName: "",
    blocks,
    license: "EUPL-1.2",
  }
  const jsonText = JSON.stringify(jsonObject, null, 2)
  navigator.clipboard.writeText(jsonText)
}
</script>

<template>
  <Popup
    class="custom-bookmark-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <!-- JSON出力ボタン -->
      <button
        class="button--plane output-json-button"
        @click.stop="outputJsonForSkyFeed"
      >
        <SVGIcon name="json" />
      </button>

      <h2>
        <SVGIcon name="bookmark" />
        <span>{{ $t("customBookmark") }}</span>
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
        class="custom-bookmark-popup__posts"
        ref="postContainer"
      >
        <Post
          v-for="post of mainState.currentCustomBookmarkPosts"
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
.custom-bookmark-popup:deep() {
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

// JSON出力ボタン
.output-json-button {
  font-size: 1.5rem;
}
</style>
