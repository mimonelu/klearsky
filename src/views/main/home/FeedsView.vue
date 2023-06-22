<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import FeedList from "@/components/FeedList.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  generator: Ref<undefined | TTFeedGenerator>
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
})

function openMyFeedsPopup () {
  Util.blurElement()
  mainState.openMyFeedsPopup()
}

function openPopularFeedsPopup () {
  Util.blurElement()
  mainState.openPopularFeedsPopup()
}
</script>

<template>
  <div class="feeds-view">
    <Portal to="home-view-header-portal">
      <!-- マイフィードポップアップトリガー -->
      <button @click.stop="openMyFeedsPopup">
        <SVGIcon name="rss" />
      </button>

      <!-- 人気のフィードポップアップトリガー -->
      <button @click.stop="openPopularFeedsPopup">
        <SVGIcon name="fire" />
      </button>
    </Portal>
    <CustomFeedCard
      v-if="state.generator != null"
      :generator="state.generator"
      :orderButtonDisplay="false"
    />
    <FeedList
      type="feeds"
      :feeds="mainState.currentCustomFeeds"
      :hasLoadButton="true"
    />
  </div>
</template>

<style lang="scss" scoped>
.feeds-view {
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