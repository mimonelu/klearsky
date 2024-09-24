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
  customBookmarkTag?: string
  customBookmarkTags: ComputedRef<Array<undefined | string>>
  customBookmarkPosts: ComputedRef<Array<TTPost>>
}>({
  processing: false,
  postContainer: computed((): undefined | HTMLElement => {
    return postContainer.value?.closest(".popup-body") ?? undefined
  }),
  customBookmarkTag: undefined,
  customBookmarkTags: computed((): Array<undefined | string> => {
    const tags: Set<undefined | string> = new Set()
    mainState.currentCustomBookmarkPacks.forEach((pack) => {
      if (pack.bookmark.tags == null) {
        return
      }
      pack.bookmark.tags.forEach((tag) => {
        tags.add(tag)
      })
    })
    return [
      undefined,
      ...tags
    ]
  }),
  customBookmarkPosts: computed((): Array<TTPost> => {
    return mainState.currentCustomBookmarkPacks
      .filter((pack) => {
        return (
          pack.post != null &&
          (
            state.customBookmarkTag == null ||
            pack.bookmark.tags?.includes(state.customBookmarkTag)
          )
        )
      })
      .map((pack) => {
        return pack.post
      }) as Array<TTPost>
  }),
})

const popup = ref()

const postContainer = ref()

onBeforeMount(async () => {
  if (mainState.currentCustomBookmarkPacks.length === 0) {
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
  const cursor = await mainState.atp.fetchCustomBookmarkPacks(
    mainState.currentCustomBookmarkPacks,
    mainState.atp.session!.did,
    CONSTS.LIMIT_OF_FETCH_CUSTOM_BOOKMARKS,
    direction === "old" ? mainState.currentCustomBookmarkPacksCursor : undefined
  )
  state.processing = false
  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "customBookmarkPopup/fetchContinuousResults")
    return
  }
  if (cursor != null && (
    direction === "old" || (
      direction === "new" &&
      mainState.currentCustomBookmarkPacksCursor == null
    )
  )) {
    mainState.currentCustomBookmarkPacksCursor = cursor
  }

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("customBookmarkPacks", mainState.currentCustomBookmarkPacks)
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}

function setCustomBookmarkTag (tag?: string) {
  state.customBookmarkTag = tag
  popup.value.scrollToTop()
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.currentCustomBookmarkPacks.forEach((pack, index) => {
    const newPost = newPosts.find((newPost) => {
      return newPost.uri === pack.post?.uri
    })
    if (newPost != null) {
      Util.updatePostProps(mainState.currentCustomBookmarkPacks[index].post as TTPost, newPost)
    }
  })
}

function removeThisPost (uri: string) {
  mainState.currentCustomBookmarkPacks = mainState.currentCustomBookmarkPacks
    .filter((pack) => {
      return pack.post?.uri !== uri
    })
}

async function outputJsonForSkyFeed () {
  Util.blurElement()
  if (!(await mainState.openConfirmationPopup({
    text: $t("customBookmarkOutputConfirmation"),
  }))) {
    return
  }
  const blocks = state.customBookmarkPosts
    .map((post) => {
      return {
        type: "input",
        inputType: "pack",
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
    ref="popup"
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
      <!-- スライダーメニュー -->
      <div
        class="slider-menu"
        ref="sliderMenu"
      >
        <template v-for="tag of state.customBookmarkTags">
          <button
            class="slider-menu__link"
            :data-is-selected-on-button="tag === state.customBookmarkTag"
            @click.stop="setCustomBookmarkTag(tag)"
          >
            <SVGIcon name="bookmark" />
            <span>{{ tag ?? "All" }}</span>
          </button>
        </template>
      </div>

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
          v-for="post of state.customBookmarkPosts"
          :key="post.uri"
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

// スライダーメニュー
.slider-menu {
  font-size: 0.875rem;
}
</style>
