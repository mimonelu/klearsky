<script lang="ts" setup>
import { inject, onMounted, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import Post from "@/components/Post.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  text: string
}>({
  text: "",
})

const router = useRouter()

watch(() => router.currentRoute.value.query.text, (value: any) => {
  updateSearchPostTerm(value)
}, { immediate: true })

onMounted(() => {
  const textbox = document.getElementById("post-term-textbox")
  if (textbox != null) textbox.focus()
})

function updateSearchPostTerm (text: string) {
  state.text = text
  if (!text || mainState.currentSearchPostTerm === text) return
  mainState.currentSearchPostTerm = text
  fetchNewResults()
}

function submitForm () {
  router.push({ name: "post-search", query: { text: state.text } })
}

async function fetchNewResults () {
  if (mainState.processing) return
  if (state.text === "") return
  mainState.currentSearchPostResults.splice(0)
  mainState.processing = true
  try {
    const results: undefined | false | Array<TTPost> =
      await mainState.atp.fetchPostSearch(state.text)
    if (results === false) return
    if (results != null) mainState.currentSearchPostResults = results
  } finally {
    mainState.processing = false
  }
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
    <form @submit.prevent="submitForm">
      <input
        v-model="state.text"
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
    <div class="main">
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
.post-search-view {
  padding-bottom: var(--sp-menu-height);

  form {
    border-bottom: 1px solid var(--fg-color-025);
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
  border-bottom: 1px solid var(--fg-color-0125);
  &[data-position="preview"] {
    padding: 1em;
  }
}
</style>
