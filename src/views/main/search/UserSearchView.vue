<script lang="ts" setup>
import { inject, onMounted, reactive, watch } from "vue"
import { useRouter } from "vue-router"
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

const router = useRouter()

onMounted(() => {
  const formItem = document.getElementById("user-term-textbox")
  if (formItem != null) formItem.focus()
})

async function fetchNewResults () {
  if (state.processing) return
  if (mainState.currentSearchUserTerm === "") return
  mainState.currentSearchLastUserTerm = mainState.currentSearchUserTerm
  mainState.currentSearchUsers.splice(0)
  state.processing = true
  try {
    mainState.currentSearchUsersCursor =
      await mainState.atp.fetchUserSearch(
        mainState.currentSearchUsers,
        mainState.currentSearchUserTerm,
        consts.limitOfFetchUserSearch
      )
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
        consts.limitOfFetchUserSearch,
        direction === "new" ? undefined : mainState.currentSearchUsersCursor
      )
  } finally {
    state.processing = false
  }
}

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
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
        :placeholder="$t('userSearch')"
        autocapitalize="off"
        autocomplete="off"
        inputmode="search"
        spellcheck="false"
        class="textbox"
      >
    </form>
    <div class="main">
      <LoadButton
        direction="new"
        :processing="state.processing"
        @activate="fetchContinuousResults('new')"
      />
      <div class="users">
        <UserBox
          v-for="user of mainState.currentSearchUsers"
          :key="user.did"
          class="user"
          :user="user"
          @click.prevent="openProfile(user.handle)"
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.load-button:first-child {
  border-top: 1px solid rgb(var(--fg-color), 0.25);
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
