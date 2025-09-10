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

const popup = ref()

const postContainer = ref()

onBeforeMount(async () => {
  if (mainState.currentOfficialBookmarks.length === 0) {
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
  const cursor = await mainState.atp.fetchOfficialBookmarks(
    mainState.currentOfficialBookmarks,
    CONSTS.LIMIT_OF_FETCH_OFFICIAL_BOOKMARKS,
    direction === "old" ? mainState.currentOfficialBookmarksCursor : undefined
  )
  state.processing = false
  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "officialBookmarkPopup/fetchContinuousResults")
    return
  }
  if (cursor != null && (
    direction === "old" || (
      direction === "new" &&
      mainState.currentOfficialBookmarksCursor == null
    )
  )) {
    mainState.currentOfficialBookmarksCursor = cursor
  }

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("officialBookmarks", mainState.currentOfficialBookmarks)
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.currentOfficialBookmarks.forEach((bookmark, index) => {
    const newPost = newPosts.find((newPost) => {
      return newPost.uri === bookmark.uri
    })
    if (newPost != null) {
      Util.updatePostProps(mainState.currentOfficialBookmarks[index].post as TTPost, newPost)
    }
  })
}

function removeThisPost (uri: string) {
  mainState.currentOfficialBookmarks = mainState.currentOfficialBookmarks
    .filter((bookmark) => {
      return bookmark.uri !== uri
    })
}
</script>

<template>
  <Popup
    class="official-bookmark-popup"
    ref="popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="bookmark" />
        <span>{{ $t("officialBookmark") }}</span>
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
        class="official-bookmark-popup__posts"
        ref="postContainer"
      >
        <!-- ブックマークなし -->
        <template v-if="mainState.currentOfficialBookmarks.length === 0">
          <div class="no-bookmark textlabel">
            <div class="textlabel__text">
              <SVGIcon name="alert" />{{ $t("noOfficialBookmark") }}
            </div>
          </div>
        </template>

        <template v-else>
          <template
            v-for="bookmark of mainState.currentOfficialBookmarks"
            :key="bookmark.uri"
          >
            <Post
              v-if="bookmark != null"
              position="post"
              :post="bookmark"
              :container="state.postContainer"
              :hasReplyIcon="bookmark.record.reply != null"
              :hasQuoteRepostIcon="bookmark.record.embed?.record != null"
              @click.exact="close"
              @updateThisPostThread="updateThisPostThread as unknown"
              @removeThisPost="removeThisPost as unknown"
              @onActivateHashTag="close"
            />
          </template>
        </template>
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
.official-bookmark-popup:deep() {
  .popup {
    &-header > h2 > .svg-icon {
      fill: rgb(var(--bookmark-color));
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

// ブックマークなし
.no-bookmark {
  padding: 1rem;
}
</style>
