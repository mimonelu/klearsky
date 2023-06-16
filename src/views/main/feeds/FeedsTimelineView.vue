<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import FeedList from "@/components/FeedList.vue"
import SelectLanguagesPopup from "@/components/SelectLanguagesPopup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  generator: Ref<undefined | TTFeedGenerator>
  selectLanguagesPopupDisplay: boolean
}>({
  generator: computedAsync(async () => {
    const uri = mainState.currentQuery.feed
    if (uri == null) return

    // 現在のフィードジェネレーターをマイフィードジェネレーターとポピュラーフィードジェネレーターから検索
    let generator: undefined | Error | TTFeedGenerator = [
      ...mainState.currentMyFeedGenerators,
      ...mainState.currentPopularFeedGenerators,
    ]
    .find((generator: TTFeedGenerator) => generator.uri === uri)

    // 上記になければ取得（ページ更新時は取得確定）
    if (generator == null) {
      generator = await mainState.atp.fetchFeedGenerator(uri)
      if (generator instanceof Error) {
        mainState.openErrorPopup("errorApiFailed", "FeedsTimelineView/fetchFeedGenerator")
        return
      }
    }

    return generator
  }),
  selectLanguagesPopupDisplay: false,
})

function openSelectLanguagesPopup () {
  Util.blurElement()
  state.selectLanguagesPopupDisplay = true
}

function closeSelectLanguagesPopup () {
  state.selectLanguagesPopupDisplay = false
}

function saveSettings () {
  mainState.saveSettings()
}
</script>

<template>
  <div class="feeds-timeline-view">
    <Portal to="custom-feeds-view-header-portal">
      <!-- 言語選択 -->
      <button
        class="button--bordered"
        @click.stop="openSelectLanguagesPopup"
      >
        <SVGIcon name="translate" />
      </button>
    </Portal>
    <CustomFeedCard
      v-if="state.generator != null"
      :generator="state.generator"
      :orderButtonDisplay="false"
    />
    <FeedList
      type="feeds-timeline"
      :feeds="mainState.currentCustomFeeds"
      :hasLoadButton="true"
    />

    <!-- 言語選択ポップアップ -->
    <SelectLanguagesPopup
      v-if="state.selectLanguagesPopupDisplay"
      :state="mainState.currentSetting"
      property="contentLanguages"
      @close="closeSelectLanguagesPopup"
      @change="saveSettings"
    >
      <template #header>
        <p>{{ $t("selectLanguagesDetail") }}</p>
      </template>
    </SelectLanguagesPopup>
  </div>
</template>

<style lang="scss" scoped>
.feeds-timeline-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.custom-feed-card {
  border-bottom: 1px solid rgba(var(--fg-color), 0.25);
}

.feed-list:deep() {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .feed:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  }

  .feed:not(:empty):not(:last-child)::after {
    border-bottom-style: none;
  }
}
</style>
