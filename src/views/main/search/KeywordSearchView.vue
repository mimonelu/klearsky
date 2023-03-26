<script lang="ts" setup>
import { inject, onMounted } from "vue"
import dateLabel from "@/composables/date-label"

const mainState = inject("state") as MainState

onMounted(() => {
  const formItem = document.getElementById("keyword-term-textbox")
  if (formItem != null) formItem.focus()
})

async function fetchNewResults () {
  if (mainState.processing) return
  if (mainState.currentSearchKeywordTerm === "") return
  mainState.currentSearchKeywordResults.splice(0)
  mainState.processing = true
  try {
    const results: undefined | Array<any> =
      await mainState.atp.fetchKeywordSearch(mainState.currentSearchKeywordTerm)
    if (results != null) mainState.currentSearchKeywordResults = results
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <div class="keyword-search-view">
    <form @submit.prevent="fetchNewResults">
      <input
        v-model="mainState.currentSearchKeywordTerm"
        id="keyword-term-textbox"
        type="search"
        :placeholder="$t('keywordSearch')"
        autocapitalize="off"
        autocomplete="off"
        inputmode="search"
        spellcheck="false"
        class="textbox"
      >
    </form>
    <div class="main">
      <div class="results">
        <RouterLink
          v-for="result of mainState.currentSearchKeywordResults"
          :to="{ name: 'post', query: { uri: `at://${result.user?.did}/${result.tid}` } }"
          class="item"
        >
          <div class="created-at">{{ dateLabel(result.post?.createdAt) }}</div>
          <div class="text">{{ result.post?.text }}</div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.keyword-search-view {
  form {
    display: contents;
  }
}

.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.results {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.item {
  border-left: 2px solid transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  grid-gap: 0.25rem;
  padding: 1rem;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  }
  &:focus, &:hover {
    border-left-color: rgb(var(--accent-color));
  }
}

.created-at {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.875rem;
}

.text {
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
