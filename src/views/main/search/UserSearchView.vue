<script lang="ts" setup>
import { inject, onMounted, reactive, watch } from "vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import UserBox from "@/components/app-parts/UserBox.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false
})

onMounted(() => {
  const textbox = document.getElementById("user-term-textbox")
  if (textbox != null) textbox.focus()

  // 検索キーワードと検索結果がない場合はおすすめアカウントを取得
  if (mainState.currentSearchUsers.length === 0) fetchNewResults()
})

async function fetchNewResults () {
  if (state.processing) return
  mainState.currentSearchLastUserTerm = mainState.currentSearchUserTerm
  mainState.currentSearchUsers.splice(0)
  state.processing = true
  try {
    // おすすめアカウントの取得
    if (mainState.currentSearchUserTerm === "") {
      await mainState.fetchSuggestions("new")
      mainState.currentSearchUsers.splice(
        0,
        mainState.currentSearchUsers.length,
        ...mainState.currentSearchSuggestionResults
      )

    // アカウント検索結果の取得
    } else {
      mainState.currentSearchUsersCursor =
        await mainState.atp.fetchUserSearch(
          mainState.currentSearchUsers,
          mainState.currentSearchUserTerm,
          CONSTS.LIMIT_OF_FETCH_USER_SEARCH
        )
    }
  } finally {
    state.processing = false
  }
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) return
  if (mainState.currentSearchUserTerm === "") return
  if (mainState.currentSearchLastUserTerm !== mainState.currentSearchUserTerm) {
    mainState.currentSearchLastUserTerm = mainState.currentSearchUserTerm
    mainState.currentSearchUsers.splice(0)
    mainState.currentSearchUsersCursor = undefined
  }
  state.processing = true
  try {
    mainState.currentSearchUsersCursor =
      await mainState.atp.fetchUserSearch(
        mainState.currentSearchUsers,
        mainState.currentSearchUserTerm,
        CONSTS.LIMIT_OF_FETCH_USER_SEARCH,
        direction === "new" ? undefined : mainState.currentSearchUsersCursor
      )
  } finally {
    state.processing = false
  }
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchContinuousResults('old')
})
</script>

<template>
  <div class="user-search-view">
    <form @submit.prevent="fetchNewResults">
      <input
        v-model="mainState.currentSearchUserTerm"
        id="user-term-textbox"
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
      <div class="users">
        <UserBox
          v-for="user of mainState.currentSearchUsers"
          :key="user.did"
          class="user"
          :user="user"
          :contentWarningDisabled="false"
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
.user-search-view {
  form {
    display: grid;
    padding: 1rem;
  }
}

.main {
  border-top: 1px solid var(--fg-color-025);
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
  cursor: pointer;
  padding: 0 1rem;
}
</style>
