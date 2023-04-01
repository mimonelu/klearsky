<script lang="ts" setup>
import { inject, onMounted } from "vue"
import { useRouter } from "vue-router"
import SVGIcon from "@/components/SVGIcon.vue"
import UserBox from "@/components/UserBox.vue"
import { blurElement } from "@/composables/misc"
import consts from "@/consts/consts.json"

const mainState = inject("state") as MainState

const router = useRouter()

onMounted(() => {
  const formItem = document.getElementById("user-term-textbox")
  if (formItem != null) formItem.focus()
})

async function fetchNewResults () {
  if (mainState.processing) return
  if (mainState.currentSearchUserTerm === "") return
  mainState.currentSearchLastUserTerm = mainState.currentSearchUserTerm
  mainState.currentSearchUsers.splice(0)
  mainState.processing = true
  try {
    mainState.currentSearchUsersCursor =
      await mainState.atp.fetchUserSearch(
        mainState.currentSearchUsers,
        mainState.currentSearchUserTerm,
        consts.limitOfFetchUserSearch
      )
  } finally {
    mainState.processing = false
  }
}

async function fetchContinuousResults (direction: "new" | "old") {
  blurElement()
  if (mainState.processing) return
  if (mainState.currentSearchUserTerm === "") return
  if (mainState.currentSearchLastUserTerm !== mainState.currentSearchUserTerm) {
    mainState.currentSearchLastUserTerm = mainState.currentSearchUserTerm
    mainState.currentSearchUsers.splice(0)
    mainState.currentSearchUsersCursor = undefined
  }
  mainState.processing = true
  try {
    mainState.currentSearchUsersCursor =
      await mainState.atp.fetchUserSearch(
        mainState.currentSearchUsers,
        mainState.currentSearchUserTerm,
        consts.limitOfFetchUserSearch,
        direction === "new" ? undefined : mainState.currentSearchUsersCursor
      )
  } finally {
    mainState.processing = false
  }
}

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}
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
      <button
        class="fetch-button"
        @click.prevent="fetchContinuousResults('new')"
      >
        <SVGIcon name="cursorUp"/>
      </button>
      <div class="users">
        <UserBox
          v-for="user of mainState.currentSearchUsers"
          class="user"
          :user="user"
          @click.prevent="openProfile(user.handle)"
        >{{ user.description }}</UserBox>
      </div>
      <button
        class="fetch-button"
        @click.prevent="fetchContinuousResults('old')"
      >
        <SVGIcon name="cursorDown"/>
      </button>
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

.fetch-button:first-child {
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
}
</style>
