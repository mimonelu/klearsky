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

const popup = ref()

const postContainer = ref()

onBeforeMount(async () => {
  await fetchContinuousResults()
})

function close () {
  emit("close")
}

async function fetchContinuousResults () {
  Util.blurElement()
  if (state.processing) {
    return
  }
  if (mainState.currentQuoteRepostsUri == null) {
    return
  }
  state.processing = true
  const uri = mainState.currentQuoteRepostsUri
  const sort = mainState.currentQuoteRepostsSort
  const cursor = await mainState.atp.fetchQuoteReposts(
    mainState.currentQuoteReposts,
    uri,
    CONSTS.LIMIT_OF_FETCH_QUOTE_REPOSTS,
    sort,
    mainState.currentQuoteRepostsCursor
  )
  state.processing = false

  // await 中に別のポストのポップアップやソート順に切り替わった場合は反映しない
  if (
    mainState.currentQuoteRepostsUri !== uri ||
    mainState.currentQuoteRepostsSort !== sort
  ) {
    return
  }

  if (cursor instanceof Error) {
    mainState.openErrorPopup(cursor, "QuoteRepostsPopup/fetchContinuousResults")
    return
  }
  if (cursor != null) {
    mainState.currentQuoteRepostsCursor = cursor
  }
}

async function changeSort (sort: "latest" | "top") {
  Util.blurElement()
  if (state.processing) {
    return
  }
  if (mainState.currentQuoteRepostsSort === sort) {
    return
  }
  mainState.currentQuoteRepostsSort = sort
  mainState.currentQuoteReposts = []
  mainState.currentQuoteRepostsCursor = undefined
  await fetchContinuousResults()
}

function scrolledToBottom () {
  fetchContinuousResults()
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  mainState.currentQuoteReposts.forEach((post: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => {
      return post.uri === newPost.uri
    })
    if (newPost != null) {
      Util.updatePostProps(mainState.currentQuoteReposts[index], newPost)
    }
  })
}

function removeThisPost (uri: string) {
  mainState.currentQuoteReposts = mainState.currentQuoteReposts
    .filter((post: TTPost) => {
      return post.uri !== uri
    })
}
</script>

<template>
  <Popup
    class="quote-reposts-popup"
    ref="popup"
    :hasCloseButton="true"
    @close="close"
    @scrolledToBottom="scrolledToBottom"
  >
    <template #header>
      <h2>
        <SVGIcon name="quoteRepost" />
        <span>{{ $t("quoteRepostsList") }}</span>
      </h2>
    </template>
    <template #header-after>
      <!-- ソートタブ -->
      <div class="tab">
        <!-- ソートタブ - 人気順 -->
        <button
          type="button"
          class="tab__button"
          :data-focused="mainState.currentQuoteRepostsSort === 'top'"
          @click="changeSort('top')"
        >
          <SVGIcon name="star" />
          <span>{{ $t("sortTop") }}</span>
        </button>

        <!-- ソートタブ - 新着順 -->
        <button
          type="button"
          class="tab__button"
          :data-focused="mainState.currentQuoteRepostsSort === 'latest'"
          @click="changeSort('latest')"
        >
          <SVGIcon name="fire" />
          <span>{{ $t("sortLatest") }}</span>
        </button>
      </div>
    </template>
    <template #body>
      <div
        class="quote-reposts-popup__posts"
        ref="postContainer"
      >
        <Post
          v-for="post of mainState.currentQuoteReposts"
          :key="post.uri"
          position="post"
          :post="post"
          :container="state.postContainer"
          :hasReplyIcon="post.record.reply != null"
          :hasQuoteRepostIcon="post.record.embed?.record != null"
          :forceHideQuoteRepost="post.embed?.record?.detached !== true"
          :forceUpdatePostThread="true"
          @click.exact="close"
          @updateThisPostThread="updateThisPostThread as unknown"
          @removeThisPost="removeThisPost as unknown"
          @onActivateHashTag="close"
        />
      </div>
    </template>
    <template #footer>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults"
      />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.quote-reposts-popup:deep() {
  .popup {
    // タブ切り替え時の読み込み中に高さが変わらないよう、最大の高さで固定する
    flex-grow: 1;

    &-header > h2 > .svg-icon {
      fill: rgb(var(--share-color));
    }
  }
}
</style>
