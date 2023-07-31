<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import CustomFeedCard from "@/components/CustomFeedCard.vue"
import FeedList from "@/components/FeedList.vue"
import PageHeader from "@/components/PageHeader.vue"
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
  <div
    class="feeds-view"
    :data-processing="!(state.generator != null)"
  >
    <Portal to="home-view-header-portal">
      <!-- マイフィードポップアップトリガー -->
      <button
        class="my-feeds-trigger"
        @click.stop="openMyFeedsPopup"
      >
        <SVGIcon name="feed" />
      </button>

      <!-- 人気のフィードポップアップトリガー -->
      <button
        class="popular-feeds-trigger"
        @click.stop="openPopularFeedsPopup"
      >
        <SVGIcon name="fire" />
      </button>
    </Portal>
    <CustomFeedCard
      v-if="state.generator != null"
      :generator="state.generator"
      :orderButtonDisplay="false"
      :creatorDisplay="true"
      :unclickable="true"
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

  // TODO: フィードカードに空の generator を渡せるようにすること
  &[data-processing="true"] .feed-list {
    margin-top: 9rem;
  }
}

.feed-list:deep() {
  --opacity: 0.125;

  // 抜け漏れ取得ボタン
  &[data-is-middle="true"] {
    --opacity: 0.25;
  }

  border-top: 1px solid rgba(var(--fg-color), 0.25);
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .feed:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), var(--opacity));
  }

  .feed:not(:empty):not(:last-child)::after {
    border-bottom-style: none;
  }
}
</style>
