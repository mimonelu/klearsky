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
  customBookmarkPacks: ComputedRef<Array<TICustomBookmarkPack>>
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
  customBookmarkPacks: computed((): Array<TICustomBookmarkPack> => {
    return mainState.currentCustomBookmarkPacks
      .filter((pack) => {
        return (
          state.customBookmarkTag == null ||
          pack.bookmark.tags?.includes(state.customBookmarkTag)
        )
      })
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

async function deleteCustomBookmark (uri: string) {
  Util.blurElement()
  if (state.processing) {
    return
  }
  state.processing = true
  const response = await mainState.atp.deleteCustomBookmark(uri)
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "CustomBookmarkPopup/deleteCustomBookmark")
    return
  }
  mainState.currentCustomBookmarkPacks = mainState.currentCustomBookmarkPacks
    .filter((pack) => {
      return pack.bookmark.uri !== uri
    })

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("customBookmarkPacks", mainState.currentCustomBookmarkPacks)
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
  const blocks = state.customBookmarkPacks
    .filter((pack) => {
      return pack.post != null
    })
    .map((pack) => {
      return {
        type: "input",
        inputType: "post",
        postUri: pack.post!.uri,
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
        <template
          v-for="tag, tagIndex of state.customBookmarkTags"
          :key="tagIndex"
        >
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
        <!-- ブックマークなし -->
        <template v-if="state.customBookmarkPacks.length === 0">
          <div class="no-bookmark textlabel">
            <div class="textlabel__text">
              <SVGIcon name="alert" />{{ $t("noCustomBookmark") }}
            </div>
          </div>
        </template>

        <template v-else>
          <template
            v-for="pack of state.customBookmarkPacks"
            :key="pack.bookmark.uri"
          >
            <Post
              v-if="pack.post != null"
              position="post"
              :post="pack.post"
              :container="state.postContainer"
              :hasReplyIcon="pack.post.record.reply != null"
              :hasQuoteRepostIcon="pack.post.record.embed?.record != null"
              @click.exact="close"
              @updateThisPostThread="updateThisPostThread"
              @removeThisPost="removeThisPost"
              @onActivateHashTag="close"
            />

            <!-- 存在しないポスト -->
            <div
              v-else
              class="post-not-exists"
            >
              <p class="post-not-exists__message">{{ $t("postNotFound") }}</p>
              <p class="post-not-exists__uri">{{ pack.bookmark.uri }}</p>
              <button
                type="button"
                class="post-not-exists__button button--important"
                @click.stop="deleteCustomBookmark(pack.bookmark.uri)"
              >
                <SVGIcon name="remove" />
                <span>{{ $t("delete") }}</span>
              </button>
            </div>
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
.custom-bookmark-popup:deep() {
  .popup {
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

// ブックマークなし
.no-bookmark {
  padding: 1rem;
}

// 存在しないポスト
.post-not-exists {
  background-color: rgb(var(--fg-color), 0.125);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5rem;
  padding: 0.75rem;

  &__message,
  &__uri {
    grid-column-end: span 2;
  }

  &__uri {
    color: rgb(var(--fg-color), 0.75);
    font-size: 0.875rem;
    user-select: text;
  }

  &__button {
    grid-column-start: 2;
  }
}
</style>
