<script lang="ts" setup>
import { inject, onMounted } from "vue"

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
        :placeholder="$t('searchWord')"
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
          v-for="result, resultIndex of mainState.currentSearchKeywordResults"
          :key="resultIndex"
          :to="{ name: 'post', query: { postUri: result.uri } }"
          class="item"
        >
          <div class="item__top">
            <RouterLink
              :to="{ name: 'profile-post', query: { handle: result.user.handle } }"
              class="textlink handle"
              @click.stop
            >{{ result.user.handle }}</RouterLink>
            <div class="created-at">{{ mainState.formatDate(result.post?.createdAt) }}</div>
          </div>
          <div class="text">{{ result.post?.text }}</div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.keyword-search-view {
  form {
    display: grid;
    padding: 1rem;
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
  border-top: 1px solid rgba(var(--fg-color), 0.125);
  border-left: 2px solid transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  grid-gap: 0.25rem;
  padding: 1rem;
  &:focus, &:hover {
    background-color: rgba(var(--accent-color), 0.125);
  }

  &__top {
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: 1fr min-content;
    align-items: center;
  }
}

.handle {
  font-weight: bold;
  flex-grow: 1;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.created-at {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.875rem;
  line-height: 1.25;
  white-space: nowrap;
}

.text {
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
