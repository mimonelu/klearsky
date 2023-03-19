<script lang="ts" setup>
import { inject, onMounted } from "vue"
import { useRouter } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

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

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
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
    <div class="main">
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
          @click.prevent="openProfile(user.handle)"
        >
          <button
            class="avatar"
            @click.stop="openProfile(user.handle)"
          >
            <img
              loading="lazy"
              :src="user.avatar ?? '/img/void-avatar.png'"
            >
          </button>
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

.user {
  cursor: pointer;
  display: grid;
  grid-gap: 0 0.5rem;
  grid-template-columns: min-content max-content 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "a n h"
    "a d d";
  align-items: center;
  padding: 0 1rem;
}

.avatar {
  grid-area: a;
  @include avatar-link(3rem);
}

.display-name {
  grid-area: n;
  color: rgba(var(--fg-color), 0.75);
  font-size: 0.875rem;
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  white-space: nowrap;
}

.handle {
  grid-area: h;
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.75rem;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description {
  grid-area: d;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
