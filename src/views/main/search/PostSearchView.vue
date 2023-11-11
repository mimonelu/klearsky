<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import Post from "@/components/app-parts/Post.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

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
  if (mainState.processing) return
  mainState.currentSearchPostsLastTerm = mainState.currentSearchTerm
  mainState.currentSearchPostResults.splice(0)
  if (!mainState.currentSearchTerm) return
  mainState.processing = true
  try {
    const results: undefined | false | Array<TTPost> =
      await mainState.atp.fetchPostSearch(mainState.currentSearchTerm)
    if (results === false) return
    if (results != null) mainState.currentSearchPostResults = results
  } finally {
    mainState.processing = false
    updateRouter()
  }
}

function updateRouter () {
  const query = mainState.currentSearchTerm !== ""
    ? { text: mainState.currentSearchTerm }
    : undefined
  router.push({ name: "post-search", query })
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  const posts = mainState.currentSearchPostResults
  posts.forEach((oldPost: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => oldPost.cid === newPost.cid)
    if (newPost != null) Util.updateReactions(posts[index], newPost)
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
      <Post
        v-for="post of mainState.currentSearchPostResults"
        :key="post.cid"
        :position="post.__custom.forcePosition != null ? post.__custom.forcePosition as any : 'post'"
        :post="post"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
        @onActivateHashTag="updateSearchPostTerm"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.post-search-view__main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.post {
  border-bottom: 1px solid var(--fg-color-0125);
  &[data-position="preview"] {
    padding: 1em;
  }
}
</style>
