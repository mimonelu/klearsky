<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserBox from "@/components/compositions/UserBox.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  mode: "recommended" | "related"
}>({
  processing: false,
  mode: "recommended",
})

const router = useRouter()

const unwatchOnQuery = watch(() => router.currentRoute.value.query.text, (value: any) => {
  if (value != null) mainState.currentSearchTerm = value
}, { immediate: true })

onMounted(async () => {
  const textbox = document.getElementById("user-term-textbox")
  if (textbox != null) textbox.focus()
  if (mainState.currentSearchLastUserTerm !== mainState.currentSearchTerm)
    await fetchNewResults()
})

onBeforeUnmount(() => {
  unwatchOnQuery()
})

async function fetchNewResults () {
  if (state.processing) return
  mainState.currentSearchLastUserTerm = mainState.currentSearchTerm
  mainState.currentSearchUsers.splice(0)
  state.processing = true

  // おすすめアカウントの取得
  if (mainState.currentSearchTerm === "") {
    await mainState.fetchSuggestions("new")
    state.processing = false
    mainState.currentSearchUsers.splice(
      0,
      mainState.currentSearchUsers.length,
      ...mainState.currentSearchSuggestionResults
    )
    state.mode = "recommended"

  // アカウント検索結果の取得
  } else {
    const cursor = await mainState.atp.fetchUserSearch(
      mainState.currentSearchUsers,
      mainState.currentSearchTerm,
      CONSTS.LIMIT_OF_FETCH_USER_SEARCH
    )
    state.processing = false
    if (cursor instanceof Error) {
      return
    }
    mainState.currentSearchUsersCursor = cursor
    state.mode = "related"
  }
  updateRouter()
}

async function fetchContinuousResults (direction: "new" | "old") {
  Util.blurElement()
  if (state.processing) {
    return
  }
  if (mainState.currentSearchTerm === "") {
    return
  }
  if (mainState.currentSearchLastUserTerm !== mainState.currentSearchTerm) {
    mainState.currentSearchLastUserTerm = mainState.currentSearchTerm
    mainState.currentSearchUsers.splice(0)
    mainState.currentSearchUsersCursor = undefined
    updateRouter()
  }
  state.processing = true
  const cursor = await mainState.atp.fetchUserSearch(
    mainState.currentSearchUsers,
    mainState.currentSearchTerm,
    CONSTS.LIMIT_OF_FETCH_USER_SEARCH,
    direction === "new" ? undefined : mainState.currentSearchUsersCursor
  )
  state.processing = false
  if (cursor instanceof Error) {
    return
  }
  mainState.currentSearchUsersCursor = cursor
}

function updateRouter () {
  const query = mainState.currentSearchTerm !== ""
    ? { text: mainState.currentSearchTerm }
    : undefined
  router.push({ name: "user-search", query })
}

function openKeywordHistoryPopover ($event: Event) {
  mainState.openKeywordHistoryPopover(
    $event.target,
    mainState.currentSetting.userSearchKeywordHistory,
    (keyword: string) => {
      mainState.currentSearchTerm = keyword
      fetchNewResults()
    }
  )
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !state.processing
  ) {
    fetchContinuousResults("old")
  }
}
</script>

<template>
  <div class="user-search-view">
    <Portal to="search-view-header">
      <!-- キーワードボックス -->
      <form @submit.prevent="fetchNewResults">
        <input
          v-model="mainState.currentSearchTerm"
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

      <!-- キーワード履歴ポップオーバートリガー -->
      <button
        class="button--bordered"
        type="button"
        @click.prevent="openKeywordHistoryPopover"
      >
        <SVGIcon name="history" />
      </button>
    </Portal>
    <div class="user-search-view__main">
      <div
        v-if="state.mode === 'recommended' && !state.processing"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="person" />{{ $t("recommendedUsers") }}
        </div>
      </div>
      <div class="users">
        <UserBox
          v-for="user of mainState.currentSearchUsers"
          :key="user.did"
          class="user"
          :user="user"
          :menuDisplay="true"
          :contentWarningDisabled="false"
          :viewerDisplay="true"
        />
      </div>
      <LoadButton
        direction="old"
        :processing="state.processing"
        @activate="fetchContinuousResults('old')"
      />
    </div>

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.user-search-view {
  .textlabel {
    margin-top: 0.5rem;
    padding-left: 1rem;
  }

  &__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
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
