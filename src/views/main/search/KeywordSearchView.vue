<script lang="ts" setup>
import { inject, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import Post from "@/components/Post.vue"

const mainState = inject("state") as MainState

const router = useRouter()

watch(() => router.currentRoute.value.query.text, (value: any) => {
  if (!value) return
  mainState.currentSearchKeywordTerm = value
  fetchNewResults()
}, { immediate: true })

onMounted(() => {
  const formItem = document.getElementById("keyword-term-textbox")
  if (formItem != null) formItem.focus()
  updateSearchKeywordTerm()
})

async function updateSearchKeywordTerm () {
  if (!mainState.currentQuery.text) return
  mainState.currentSearchKeywordTerm = mainState.currentQuery.text
}

function submitForm () {
  router.push({ name: "keyword-search", query: { text: mainState.currentSearchKeywordTerm } })
}

async function fetchNewResults () {
  if (mainState.processing) return
  if (mainState.currentSearchKeywordTerm === "") return
  mainState.currentSearchKeywordResults.splice(0)
  mainState.processing = true
  try {
    const results: undefined | false | Array<TTPost> =
      await mainState.atp.fetchKeywordSearch(mainState.currentSearchKeywordTerm)
    if (results === false) return
    if (results != null) mainState.currentSearchKeywordResults = results
  } finally {
    mainState.processing = false
  }
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  const posts = mainState.currentSearchKeywordResults
  posts.forEach((oldPost: TTPost, index: number) => {
    const newPost = newPosts.find((newPost: TTPost) => oldPost.cid === newPost.cid)
    if (newPost != null) posts[index] = newPost
  })
}

function removeThisPost (uri: string) {
  mainState.currentSearchKeywordResults = mainState.currentSearchKeywordResults
    .filter((post: TTPost) => post.uri !== uri)
}

function onActivateHashTag () {
  fetchNewResults()
}
</script>

<template>
  <div class="keyword-search-view">
    <form @submit.prevent="submitForm">
      <input
        v-model="mainState.currentSearchKeywordTerm"
        id="keyword-term-textbox"
        type="search"
        :placeholder="$t('searchWord')"
        autocapitalize="off"
        autocomplete="off"
        inputmode="search"
        spellcheck="false"
        class="textbox"
      >
    </form>
    <div class="main">
      <Post
        v-for="post of mainState.currentSearchKeywordResults"
        :key="post.cid"
        position="post"
        :post="post"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
        @onActivateHashTag="onActivateHashTag"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.keyword-search-view {
  padding-bottom: var(--sp-menu-height);

  form {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
    display: grid;
    padding: 1rem;
  }
}

.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.post {
  border-bottom: 1px solid rgba(var(--fg-color), 0.125);
}
</style>
