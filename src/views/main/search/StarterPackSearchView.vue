<script lang="ts" setup>
import { inject, onBeforeUnmount, onMounted, reactive, watch } from "vue"
import { useRouter } from "vue-router"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/ScrollObserver.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

const router = useRouter()

const unwatchOnQuery = watch(() => router.currentRoute.value.query.text, (value: any) => {
  if (value != null) mainState.currentSearchTerm = value
}, { immediate: true })

onMounted(async () => {
  const textbox = document.getElementById("starter-pack-term-textbox")
  if (textbox != null) textbox.focus()
  if (mainState.currentSearchStarterPacksLastTerm !== mainState.currentSearchTerm)
    await fetchNewResults()
})

onBeforeUnmount(() => {
  unwatchOnQuery()
})

async function fetchNewResults () {
  // 検索ワードを変えておきながら検索せずに画面遷移した場合、
  // `watch` が後から反応してしまい、フィード検索画面に遷移してしまう不具合への対応
  if (router.currentRoute.value.name !== "starter-pack-search") {
    return
  }

  if (state.processing) {
    return
  }
  mainState.currentSearchStarterPacksLastTerm = mainState.currentSearchTerm
  mainState.currentSearchStarterPacks.splice(0)
  if (mainState.currentSearchTerm === "") {
    return
  }
  state.processing = true
  await mainState.fetchSearchStarterPacks("new")
  state.processing = false

  // fetch 中に他タブへ遷移していた場合、このビューへ強制遷移してしまう不具合への対応
  if (router.currentRoute.value.name !== "starter-pack-search") {
    return
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
  if (mainState.currentSearchStarterPacksLastTerm !== mainState.currentSearchTerm) {
    mainState.currentSearchStarterPacksLastTerm = mainState.currentSearchTerm
    mainState.currentSearchStarterPacks.splice(0)
    mainState.currentSearchStarterPacksCursor = undefined
    updateRouter()
  }
  state.processing = true
  await mainState.fetchSearchStarterPacks(direction)
  state.processing = false
}

function updateRouter () {
  const query = mainState.currentSearchTerm !== ""
    ? { text: mainState.currentSearchTerm }
    : undefined
  router.push({ name: "starter-pack-search", query })
}

function openKeywordHistoryPopover ($event: Event) {
  mainState.openKeywordHistoryPopover(
    $event.target,
    mainState.currentSetting.starterPackSearchKeywordHistory,
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
  <div class="starter-pack-search-view">
    <Portal to="search-view-header">
      <form @submit.prevent="fetchNewResults">
        <div class="group-parts">
          <!-- キーワードボックス -->
          <input
            v-model="mainState.currentSearchTerm"
            id="starter-pack-term-textbox"
            type="search"
            :placeholder="$t('starterPackSearch')"
            autocapitalize="off"
            autocomplete="off"
            inputmode="search"
            spellcheck="false"
            class="textbox"
          >

          <!-- キーワード履歴ポップオーバートリガー -->
          <button
            type="button"
            class="button--bordered"
            @click.prevent="openKeywordHistoryPopover"
          >
            <SVGIcon name="history" />
          </button>
        </div>
      </form>
    </Portal>
    <div class="starter-pack-search-view__main">
      <div class="starter-pack-card-container">
        <StarterPackCard
          v-for="starterPack of mainState.currentSearchStarterPacks"
          :key="starterPack.uri"
          :starterPack="starterPack as TIStarterPack"
          :menuDisplay="true"
          :detailDisplay="false"
          :creatorDisplay="true"
          :unclickable="false"
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
.starter-pack-search-view {
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

.starter-pack-card-container {
  flex-grow: 1;
}
</style>
