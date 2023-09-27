<script lang="ts" setup>
import { computed, inject, onBeforeMount, reactive, ref, type ComputedRef } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
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
  await fetchContinuousResults("old")
})

function close () {
  emit("close")
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  if (mainState.timeFeedsPopupProps == null) return
  state.processing = true
  await mainState.atp.fetchTimeFeeds(
    mainState.currentTimeFeeds,
    direction,
    mainState.timeFeedsPopupProps.author,
    CONSTS.LIMIT_OF_FETCH_AUTHOR_FEEDS
  )
  state.processing = false
}

function scrolledToBottom () {
  fetchContinuousResults("old")
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.currentTimeFeeds.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => post.cid === newPost.cid)
    if (newPost != null) Util.updateReactions(mainState.currentTimeFeeds[index], newPost)
  })
}

function removeThisPost (uri: string) {
  mainState.currentTimeFeeds = mainState.currentTimeFeeds
    .filter((post: TTPost) => {
      return post.uri !== uri
    })
}
</script>

<template>
  <Popup
    class="time-feeds-popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="history" />
        <span>{{ $t("timeFeeds") }} - {{ mainState.timeFeedsPopupProps?.author?.displayName }}</span>
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
        class="time-feeds-popup__posts"
        ref="postContainer"
      >
        <Post
          v-for="post of mainState.currentTimeFeeds"
          :key="post.cid"
          position="post"
          :post="post"
          :container="state.postContainer"
          :forceFocus="mainState.timeFeedsPopupProps?.uri === post.uri"
          @click="close"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
          @onActivateHashTag="close"
        >
          <template #header-before>
            <!-- リプライ／引用リポストアイコン -->
            <div
              v-if="post.record.reply != null"
              class="reply-icon"
            >
              <SVGIcon name="reply" />
              <span>{{ $t("reply") }}</span>
            </div>
            <div
              v-if="post.record.embed?.record != null"
              class="quote-repost-icon"
            >
              <SVGIcon name="quoteRepost" />
              <span>{{ $t("quoteRepost") }}</span>
            </div>
          </template>
        </Post>
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
.time-feeds-popup:deep() {
  .popup {
    height: 100%;

    &-body {
      padding: 0;
    }
  }
}

.post[data-focus="true"] {
  background-color: var(--accent-color-0125);
}

// リプライ／引用リポストアイコン
.reply-icon,
.quote-repost-icon {
  display: flex;
  align-items: center;
  grid-gap: 0.25em;

  & > .svg-icon,
  & > span {
    font-size: 0.875em;
  }
  & > span {
    font-weight: bold;
  }
}
.reply-icon {
  & > .svg-icon {
    fill: rgb(var(--post-color));
  }
  & > span {
    color: rgb(var(--post-color));
  }
}
.quote-repost-icon {
  & > .svg-icon {
    fill: rgb(var(--share-color));
  }
  & > span {
    color: rgb(var(--share-color));
  }
}
</style>
