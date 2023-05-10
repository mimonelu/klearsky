<script lang="ts" setup>
import { inject, onMounted, reactive, watch } from "vue"
import LoadButton from "@/components/LoadButton.vue"
import UserBox from "@/components/UserBox.vue"
import Util from "@/composables/util/index"
import consts from "@/consts/consts.json"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false
})

onMounted(async () => {
  if (mainState.currentSearchSuggestionResults.length === 0)
    await fetchContinuousResults("new")
})

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  try {
    mainState.currentSearchSuggestionCursor =
      await mainState.atp.fetchSuggestions(
        mainState.currentSearchSuggestionResults,
        consts.limitOfFetchSuggestionSearch,
        direction === "new" ? undefined : mainState.currentSearchSuggestionCursor
      )
  } finally {
    state.processing = false
  }
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchContinuousResults("old")
})
</script>

<template>
  <div class="suggestion-search-view">
    <div class="main">
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
      <div class="users">
        <UserBox
          v-for="user of mainState.currentSearchSuggestionResults"
          :key="user.did"
          class="user"
          :user="user"
        />
      </div>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.suggestion-search-view {
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

.users {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 1rem;
  padding: 1rem 0;
}

.user-box {
  padding: 0 1rem;
}
</style>
