<script lang="ts" setup>
import { inject, onMounted } from "vue"
import PageHeader from "@/components/PageHeader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const mainState = inject("state") as MainState

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
        25
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
        25,
        direction === "new" ? undefined : mainState.currentSearchUsersCursor
      )
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <div class="search-view">
    <PageHeader :title="$t('search')" />
    <form @submit.prevent="fetchNewResults">
      <input
        v-model="mainState.currentSearchUserTerm"
        id="user-term-textbox"
        type="text"
        placeholder="User search"
        autocomplete="user"
        class="textbox"
      >
    </form>
    <button
      class="fetch-button"
      @click.prevent="fetchContinuousResults('new')"
    >
      <SVGIcon name="cursorUp"/>
    </button>
    <div class="users">
      <div
        v-for="user of mainState.currentSearchUsers"
        class="user"
      >
        <div class="avatar">{{ user.avatar }}</div>
        <div class="display-name">{{ user.displayName }}</div>
        <div class="handle">{{ user.handle }}</div>
        <div class="description">{{ user.description }}</div>
      </div>
    </div>
    <button
      class="fetch-button"
      @click.prevent="fetchContinuousResults('old')"
    >
      <SVGIcon name="cursorDown"/>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.search-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  form {
    display: contents;
  }
}

.users {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 1rem;
}
</style>
