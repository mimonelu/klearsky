<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Post from "@/components/compositions/Post.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

const router = useRouter()

const unwatchOnQuery = watch(() => router.currentRoute.value.query, async (value: any) => {
  /*
  if (
    mainState.currentSearchTerm !== "" &&
    mainState.currentSearchTerm !== mainState.currentSearchPostsLastTerm
  ) {
    await fetchNewResults()
  }
  */
  if (updatedSearchQueries(value)) {
    await fetchNewResults()
  }
}, { immediate: true })

onMounted(async () => {
  const textbox = document.getElementById("post-term-textbox")
  if (textbox != null) {
    textbox.focus()
  }
  if (mainState.currentSearchTerm &&
      mainState.currentSearchPostsLastTerm !== mainState.currentSearchTerm
  ) {
    await fetchNewResults()
  }
})

onBeforeUnmount(() => {
  unwatchOnQuery()
})

async function onSubmit () {
  // キーワード入力ボックス押下時、未入力であれば検索ステートをクリア
  if (mainState.currentSearchTerm === "") {
    resetState()
  }

  await fetchNewResults()
}

function updatedSearchQueries (value: any): boolean {
  let diff = false
  if (mainState.currentSearchTerm !== (value?.text ?? "")) {
    diff = true
  }
  mainState.currentSearchTerm = value?.text ?? ""
  if (mainState.currentSearchPostFormState.sort !== value?.sort) {
    diff = true
  }
  mainState.currentSearchPostFormState.sort = value?.sort
  if (mainState.currentSearchPostFormState.lang !== value?.lang) {
    diff = true
  }
  mainState.currentSearchPostFormState.lang = value?.lang
  if (mainState.currentSearchPostFormState.author !== value?.author) {
    diff = true
  }
  mainState.currentSearchPostFormState.author = value?.author
  if (mainState.currentSearchPostFormState.to !== value?.to) {
    diff = true
  }
  mainState.currentSearchPostFormState.to = value?.to
  if (mainState.currentSearchPostFormState.mentions !== value?.mentions) {
    diff = true
  }
  mainState.currentSearchPostFormState.mentions = value?.mentions
  if (mainState.currentSearchPostFormState.domain !== value?.domain) {
    diff = true
  }
  mainState.currentSearchPostFormState.domain = value?.domain
  if (mainState.currentSearchPostFormState.since !== value?.since) {
    diff = true
  }
  mainState.currentSearchPostFormState.since = value?.since
  if (mainState.currentSearchPostFormState.until !== value?.until) {
    diff = true
  }
  mainState.currentSearchPostFormState.until = value?.until
  return diff
}

function updateSearchPostTerm (text: string) {
  mainState.currentSearchTerm = decodeURIComponent(text)
  resetState()
  fetchNewResults()
}

// `fetchContinuousResults` 以外のタイミングでコール
async function fetchNewResults () {
  // 検索ワードを変えておきながら検索せずに画面遷移した場合、
  // `watch` が後から反応してしまい、ポスト検索画面に遷移してしまう不具合への対応
  if (router.currentRoute.value.name !== "post-search") {
    return
  }

  if (state.processing) {
    return
  }
  mainState.currentSearchPostsLastTerm = mainState.currentSearchTerm
  mainState.currentSearchPostResults.splice(0)
  mainState.currentSearchPostCursor = undefined
  updateRouter()
  if (!canSearch()) {
    return
  }
  state.processing = true
  await mainState.fetchSearchPosts()
  state.processing = false
}

// ロードボタン押下時と画面最下部到達時にコール
async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) {
    return
  }
  if (mainState.currentSearchPostsLastTerm !== mainState.currentSearchTerm) {
    mainState.currentSearchPostsLastTerm = mainState.currentSearchTerm
    mainState.currentSearchPostResults.splice(0)
    mainState.currentSearchPostCursor = undefined
    updateRouter()
  }
  if (!canSearch()) {
    return
  }
  state.processing = true
  await mainState.fetchSearchPosts(
    direction === "new"
      ? undefined
      : mainState.currentSearchPostCursor
  )
  state.processing = false
}

function resetState () {
  Object.keys(mainState.currentSearchPostFormState).forEach((key) => {
    (mainState.currentSearchPostFormState as any)[key] = undefined
  })
}

function canSearch (): boolean {
  return (
    mainState.currentSearchTerm !== "" ||
    Object.keys(mainState.currentSearchPostFormState)
      .filter((key) => {
        return key !== "sort"
      })
      .some((key) => {
        return (mainState.currentSearchPostFormState as any)[key] != null
      })
  )
}

function updateRouter () {
  const query: { [k: string]: undefined | string } = { text: mainState.currentSearchTerm || undefined }
  Object.keys(mainState.currentSearchPostFormState).forEach((key) => {
    query[key] = (mainState.currentSearchPostFormState as any)[key] || undefined
  })
  router.push({ name: "post-search", query })
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  const posts = mainState.currentSearchPostResults
  posts.forEach((oldPost: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => oldPost.uri === newPost.uri)
    if (newPost != null) {
      Util.updatePostProps(posts[index], newPost)
    }
  })
}

function removeThisPost (uri: string) {
  mainState.currentSearchPostResults = mainState.currentSearchPostResults
    .filter((post: TTPost) => post.uri !== uri)
}

function openKeywordHistoryPopover ($event: Event) {
  mainState.openKeywordHistoryPopover(
    $event.target,
    mainState.currentSetting.postSearchKeywordHistory,
    (keyword: string) => {
      mainState.currentSearchTerm = keyword
      resetState()
      fetchNewResults()
    }
  )
}

function openAdvancedSearchPopup () {
  mainState.openAdvancedSearchPopup()
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !state.processing
  ) {
    fetchContinuousResults("old")
  }
}
</script>

<template>
  <div class="post-search-view">
    <Portal to="search-view-header">
      <form @submit.prevent="onSubmit">
        <div class="group-parts">
          <!-- キーワード入力ボックス -->
          <input
            v-model="mainState.currentSearchTerm"
            id="post-term-textbox"
            type="search"
            :placeholder="$t('postSearch')"
            autocapitalize="off"
            autocomplete="off"
            inputmode="search"
            spellcheck="false"
            class="textbox"
          >

          <!-- キーワード履歴ポップオーバートリガー -->
          <button
            type="button"
            class="button--bordered"
            @click.prevent="openKeywordHistoryPopover"
          >
            <SVGIcon name="history" />
          </button>

          <!-- 詳細検索ポップアップトリガー -->
          <button
            type="button"
            class="button--bordered"
            @click.prevent="openAdvancedSearchPopup"
          >
            <SVGIcon name="setting" />
          </button>
        </div>
      </form>
    </Portal>
    <div class="post-search-view__main">
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
      <div class="post-container">
        <template
          v-for="post of mainState.currentSearchPostResults"
          :key="post.uri"
        >
          <!-- NOTICE: ミュートユーザーは非表示 -->
          <Post
            v-if="!post.author.viewer.muted && post.author.viewer.mutedByList == null"
            :position="post.__custom.forcePosition != null ? post.__custom.forcePosition as any : 'post'"
            :post="post"
            :hasReplyIcon="post.record.reply != null"
            :hasQuoteRepostIcon="post.record.embed?.record != null"
            @updateThisPostThread="updateThisPostThread"
            @removeThisPost="removeThisPost"
            @onActivateHashTag="updateSearchPostTerm"
          />
        </template>
      </div>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </div>

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.post-search-view {
  position: relative;

  &__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
}

.post-container {
  flex-grow: 1;
}

.post[data-position="preview"] {
  padding: 1em;
}
</style>
