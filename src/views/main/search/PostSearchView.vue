<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, reactive, watch, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import Loader from "@/components/common/Loader.vue"
import Pagenation from "@/components/common/Pagenation.vue"
import Post from "@/components/app-parts/Post.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  pagenationDisplay: ComputedRef<boolean>
  pagenationProps: ComputedRef<{
    numberOfPager: number
    total?: number
    unit?: number
    cursor?: number
    isLast: boolean
  }>
}>({
  processing: false,
  pagenationDisplay: computed((): boolean => {
    return !!mainState.currentSearchTerm && (
      mainState.currentSearchPostResults?.length > 0 ||
      mainState.currentSearchPostCursor != null ||
      mainState.currentSearchPostTotal != null
    )
  }),
  pagenationProps: computed(() => {
    return {
      numberOfPager: CONSTS.NUMBER_OF_POST_SEARCH_BUTTON,
      total: mainState.currentSearchPostTotal,
      unit: CONSTS.LIMIT_OF_FETCH_POST_SEARCH,
      cursor: mainState.currentSearchPostCursor != null ? parseInt(mainState.currentSearchPostCursor, 10) : mainState.currentSearchPostCursor,
      isLast: mainState.currentSearchPostIsLast,
    }
  }),
})

const router = useRouter()

const unwatchOnQuery = watch(() => router.currentRoute.value.query.text, async (value: any) => {
  if (value != null) mainState.currentSearchTerm = value
  if (mainState.currentSearchTerm !== "" &&
      mainState.currentSearchPostsLastTerm !== mainState.currentSearchTerm)
    await fetchNewResults()
}, { immediate: true })

onMounted(async () => {
  const textbox = document.getElementById("post-term-textbox")
  if (textbox != null) textbox.focus()
  if (mainState.currentSearchTerm &&
      mainState.currentSearchPostsLastTerm !== mainState.currentSearchTerm)
    await fetchNewResults()
})

onBeforeUnmount(() => {
  unwatchOnQuery()
})

function updateSearchPostTerm (text: string) {
  const textDecoded = decodeURIComponent(text)
  if (!textDecoded || mainState.currentSearchTerm === textDecoded) return
  mainState.currentSearchTerm = textDecoded
  fetchNewResults()
}

async function fetchNewResults () {
  // 検索ワードを変えておきながら検索せずに画面遷移した場合、
  // `watch` が後から反応してしまい、ポスト検索画面に遷移してしまう不具合への対応
  if (router.currentRoute.value.name !== "post-search") return

  if (state.processing) return
  mainState.currentSearchPostsLastTerm = mainState.currentSearchTerm
  mainState.currentSearchPostResults.splice(0)
  mainState.currentSearchPostCursor = undefined
  mainState.currentSearchPostTotal = undefined
  updateRouter()
  if (!mainState.currentSearchTerm) return
  state.processing = true
  await mainState.fetchSearchPosts()
  state.processing = false
}

async function fetchPartialResults (page: number) {
  Util.blurElement()
  if (state.processing) return
  if (mainState.currentSearchPostsLastTerm !== mainState.currentSearchTerm) {
    mainState.currentSearchPostsLastTerm = mainState.currentSearchTerm
    mainState.currentSearchPostCursor = undefined
    mainState.currentSearchPostTotal = undefined
    updateRouter()
  }
  mainState.currentSearchPostResults.splice(0)
  state.processing = true
  await mainState.fetchSearchPosts(page.toString())
  state.processing = false
  mainState.currentSearchPostCursor = page.toString()
}

function updateRouter () {
  const query = mainState.currentSearchTerm !== ""
    ? { text: mainState.currentSearchTerm }
    : undefined
  router.push({ name: "post-search", query })
}

async function paging (page: number) {
  await fetchPartialResults(page)
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  const posts = mainState.currentSearchPostResults
  posts.forEach((oldPost: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => oldPost.cid === newPost.cid)
    if (newPost != null) Util.updatePostProps(posts[index], newPost)
  })
}

function removeThisPost (uri: string) {
  mainState.currentSearchPostResults = mainState.currentSearchPostResults
    .filter((post: TTPost) => post.uri !== uri)
}
</script>

<template>
  <div class="post-search-view">
    <Portal to="search-view-header">
      <form @submit.prevent="fetchNewResults">
        <input
          v-model="mainState.currentSearchTerm"
          id="post-term-textbox"
          type="search"
          :placeholder="$t('keyword')"
          autocapitalize="off"
          autocomplete="off"
          inputmode="search"
          spellcheck="false"
          class="textbox"
        >
      </form>
    </Portal>
    <div class="post-search-view__main">
      <Pagenation
        v-if="state.pagenationDisplay"
        v-bind="state.pagenationProps"
        @paging="paging"
      />
      <div class="post-container">
        <Post
          v-for="post of mainState.currentSearchPostResults"
          :key="post.cid"
          :position="post.__custom.forcePosition != null ? post.__custom.forcePosition as any : 'post'"
          :post="post"
          :hasReplyIcon="post.record.reply != null"
          :hasQuoteRepostIcon="post.record.embed?.record != null"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
          @onActivateHashTag="updateSearchPostTerm"
        />
      </div>
      <Pagenation
        v-if="state.pagenationDisplay"
        v-bind="state.pagenationProps"
        @paging="paging"
      />
    </div>
    <Loader v-if="state.processing" />
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

.post {
  &:not(:last-child) {
    border-bottom: 1px solid var(--fg-color-0125);
  }
  &[data-position="preview"] {
    padding: 1em;
  }
}

.pagenation {
  padding: 0.375rem 0;
  &:first-child {
    border-bottom: 1px solid var(--fg-color-025);
  }
  &:last-child {
    border-top: 1px solid var(--fg-color-025);
  }
}
</style>
