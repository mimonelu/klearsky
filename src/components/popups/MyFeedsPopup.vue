<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import FeedCard from "@/components/app-parts/FeedCard.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  orderChanged: boolean
  popupLoaderDisplay: boolean
}>({
  orderChanged: false,
  popupLoaderDisplay: true,
})

onMounted(async () => {
  // Preferences の取得
  state.popupLoaderDisplay = true
  const preferences = await mainState.fetchPreferences()
  state.popupLoaderDisplay = false
  if (!preferences) {
    mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchPreferences")
    return
  }

  // ブックマークが存在しない
  if (mainState.feedPreferences?.saved == null) {
    mainState.currentMyFeedGenerators.splice(0)
    return
  }

  // ブックマークが存在する＆差分がない
  const savedBefore = JSON.stringify(mainState.currentMyFeedGenerators
    .map((generator: TTFeedGenerator) => generator.uri))
  const savedAfter = JSON.stringify(mainState.feedPreferences?.saved ?? [])
  if (savedBefore === savedAfter && mainState.currentMyFeedGenerators.length > 0) return

  // マイフィードジェネレーターの取得
  state.popupLoaderDisplay = true
  await mainState.fetchMyFeedGenerators()
  mainState.sortMyFeedGenerators()
  state.popupLoaderDisplay = false
})

async function close () {
  if (state.orderChanged) {
    state.popupLoaderDisplay = true
    mainState.sortMyFeedGenerators()
    mainState.sortFeedPreferencesSavedAndPinned()
    const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
    if (!result) mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/updatePreferences")
    state.popupLoaderDisplay = false

    // セッションキャッシュの更新
    if (result) {
      mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
      mainState.myWorker.setSessionCache("currentMyFeedGenerators", mainState.currentMyFeedGenerators)
    }
  }
  emit("close")
}

function changeCustomFeedOrder () {
  const saved = mainState.feedPreferences?.saved
  if (saved == null) return

  // マイフィードジェネレーターのソート
  const generators: Array<TTFeedGenerator> = []
  saved.forEach((uri: string) => {
    const generator = mainState.currentMyFeedGenerators.find((generator: TTFeedGenerator) => generator.uri === uri)
    if (generator == null) return
    generators.push(generator)
  })
  mainState.currentMyFeedGenerators.splice(0, mainState.currentMyFeedGenerators.length, ...generators)

  // マイフィードのソート
  const myFeeds: {[uri: string]: any} = {}
  saved.forEach((uri: string) => {
    const myFeed = mainState.currentMyFeeds[uri]
    if (myFeed == null) return
    myFeeds[uri] = myFeed
  })
  mainState.currentMyFeeds = myFeeds

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
      <h2>
        <SVGIcon name="feed" />
        <span>{{ $t("myFeeds") }}</span>
      </h2>
    </template>
    <template #body>
      <div
        v-if="!state.popupLoaderDisplay && mainState.currentMyFeedGenerators.length === 0"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noMyFeeds") }}
        </div>
      </div>
      <template v-else>
        <FeedCard
          v-for="generator of mainState.currentMyFeedGenerators"
          :key="generator.uri"
          :generator="generator"
          :menuDisplay="true"
          :orderButtonDisplay="true"
          :creatorDisplay="true"
          @click="close"
          @changeCustomFeedOrder="changeCustomFeedOrder"
          @onActivateMention="close"
          @onActivateHashTag="close"
        />
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

  .feed-card:not(:last-child) {
    border-bottom: 1px solid var(--fg-color-0125);
  }

  .textlabel {
    margin: 1rem;
  }
}
</style>
