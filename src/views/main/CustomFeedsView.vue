<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
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
  <div class="custom-feeds-view">
    <PageHeader
      :hasBackButton="true"
      :title="$t('customFeeds')"
      :subTitle="mainState.currentQuery.displayName"
    >
      <template #right>
        <!-- VuePortal の出口 -->
        <PortalTarget name="custom-feeds-view-header-portal" />

        <!-- マイフィードポップアップトリガー -->
        <button @click.stop="openMyFeedsPopup">
          <SVGIcon name="rss" />
        </button>

        <!-- 人気のフィードポップアップトリガー -->
        <button @click.stop="openPopularFeedsPopup">
          <SVGIcon name="fire" />
        </button>
      </template>
    </PageHeader>
    <RouterView class="child-view" />
  </div>
</template>

<style lang="scss" scoped>
.custom-feeds-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .page-header {
    z-index: 2;
  }
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
