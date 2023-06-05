<script lang="ts" setup>
import { inject, onMounted, reactive } from "vue"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const state = reactive<{
  orderChanged: boolean
}>({
  orderChanged: false,
})

onMounted(async () => {
  // Preferences の取得
  mainState.processing = true
  const preferences = await mainState.fetchPreferences()
  mainState.processing = false
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
  mainState.processing = true
  const generators = await mainState.atp.fetchFeedGenerators(mainState.feedPreferences.saved)
  mainState.processing = false
  if (generators instanceof Error) {
    mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/fetchFeedGenerators")
    return
  }
  mainState.currentMyFeedGenerators.splice(0, mainState.currentMyFeedGenerators.length, ...generators)
})

async function close () {
  if (state.orderChanged) {
    mainState.processing = true
    if (!await mainState.atp.updatePreferences(mainState.currentPreferences))
      mainState.openErrorPopup("errorApiFailed", "MyFeedsPopup/updatePreferences")
    mainState.processing = false
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
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="rss" />
        <span>{{ $t("myFeeds") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <div
        v-if="mainState.currentMyFeedGenerators.length === 0"
        class="textlabel"
        :data-is-processing="mainState.processing"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noFeeds") }}
        </div>
      </div>
      <template v-else>
        <CustomFeedCard
          v-for="generator of mainState.currentMyFeedGenerators"
          :key="generator.cid"
          :generator="generator"
          :orderButtonDisplay="true"
          @click="close"
          @changeCustomFeedOrder="changeCustomFeedOrder"
        />
      </template>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.my-feeds-popup:deep() {
  .popup-header {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);

    & > h2 {
      color: rgb(var(--accent-color));

      & > .svg-icon {
        fill: rgb(var(--accent-color));
      }
    }
  }

  .popup-body {
    grid-gap: unset;
    padding: unset;
  }

  .custom-feed-card:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  }

  .textlabel {
    margin: 1rem;
    &[data-is-processing="true"] {
      visibility: hidden;
    }
  }
}
</style>
