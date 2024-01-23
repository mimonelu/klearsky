<script lang="ts" setup>
import { inject, reactive } from "vue"
import FeedCard from "@/components/app-parts/FeedCard.vue"
import ListCard from "@/components/list/ListCard.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  orderChanged: boolean
  popupLoaderDisplay: boolean
}>({
  orderChanged: false,
  popupLoaderDisplay: false,
})

async function close () {
  if (state.orderChanged) {
    state.popupLoaderDisplay = true
    mainState.sortFeedPreferencesSavedAndPinned()
    const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
    if (!result) mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/updatePreferences")
    state.popupLoaderDisplay = false

    // セッションキャッシュの更新
    if (result) {
      mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
      mainState.myWorker.setSessionCache("myFeeds.items", mainState.myFeeds.items)
    }
  }
  emit("close")
}

async function fetchMyFeeds () {
  // Preferences の取得
  state.popupLoaderDisplay = true
  const preferences = await mainState.fetchPreferences()
  if (!preferences) {
    mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchPreferences")
    state.popupLoaderDisplay = false
    return
  }

  // ブックマークが存在しない
  if (mainState.feedPreferences?.saved == null) {
    mainState.myFeeds.clearItems()
    state.popupLoaderDisplay = false
    return
  }

  // マイフィードジェネレーターの取得
  await mainState.myFeeds.fetchItems()
  mainState.myFeeds.sortItems()
  state.popupLoaderDisplay = false
}

function changeCustomFeedOrder () {
  const saved = mainState.feedPreferences?.saved
  if (saved == null) return

  // マイフィードのソート
  mainState.myFeeds.sortItems()

  state.orderChanged = true
}
</script>

<template>
  <Popup
    class="my-feeds-popup"
    :hasCloseButton="true"
    :loaderDisplay="state.popupLoaderDisplay"
    @close="close"
  >
    <template #header>
      <button @click.stop="fetchMyFeeds">
        <SVGIcon name="refresh" />
      </button>
      <h2>
        <SVGIcon name="feed" />
        <span>{{ $t("myFeeds") }}</span>
      </h2>
    </template>
    <template #body>
      <div
        v-if="!state.popupLoaderDisplay && mainState.myFeeds.items.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noMyFeeds") }}
        </div>
      </div>
      <template v-else>
        <template
          v-for="item of mainState.myFeeds.items"
          :key="item.value.uri"
        >
          <!-- フィードカード -->
          <FeedCard
            v-if="item.kind === 'feed'"
            :generator="item.value"
            :menuDisplay="true"
            :orderButtonDisplay="true"
            :creatorDisplay="true"
            @click="close"
            @changeCustomFeedOrder="changeCustomFeedOrder"
            @onActivateMention="close"
            @onActivateHashTag="close"
          />

          <!-- リストカード -->
          <ListCard
            v-else-if="item.kind === 'list'"
            :list="item.value"
            :isCompact="false"
            :createDisplay="true"
            @close="close"
            @onActivateMention="close"
            @onActivateHashTag="close"
          />
        </template>
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-feeds-popup:deep() {
  .popup {
    flex-grow: 1;
    height: 100%;
  }

  .popup-header {
    & > h2 > .svg-icon {
      fill: rgb(var(--accent-color));
    }
  }

  .popup-body {
    flex-grow: 1;
    grid-gap: unset;
    padding: unset;
  }

  .feed-card,
  .list-card {
    &:not(:last-child) {
      border-bottom: 1px solid var(--fg-color-0125);
    }
  }

  .textlabel {
    margin: 1rem;
  }
}
</style>
