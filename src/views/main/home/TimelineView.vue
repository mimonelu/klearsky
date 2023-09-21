<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/list/FeedList.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

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
  <FeedList
    class="timeline-view"
    type="timeline"
    :feeds="mainState.timelineFeeds"
    :hasLoadButton="true"
  />
</template>

<style lang="scss" scoped>
.timeline-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
