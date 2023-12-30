<script lang="ts" setup>
import { inject } from "vue"
import PageHeader from "@/components/shell-parts/PageHeader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

function openMyFeedsPopup () {
  Util.blurElement()
  mainState.openMyFeedsPopup()
}

function openMyListPopup () {
  Util.blurElement()
  mainState.openMyListPopup()
}
</script>

<template>
  <div class="home-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('home')"
        :subTitle="mainState.atp.session?.__serviceName ?? ''"
      >
        <template #right>
          <PortalTarget name="home-view-header-top" />

          <!-- マイフィードポップアップトリガー -->
          <button
            class="my-feeds-trigger"
            @click.stop="openMyFeedsPopup"
          >
            <SVGIcon name="feed" />
          </button>

          <!-- マイリストポップアップトリガー -->
          <button
            class="my-list-trigger"
            @click.stop="openMyListPopup"
          >
            <SVGIcon name="list" />
          </button>
        </template>
      </PageHeader>
      <div class="tab">
        <RouterLink
          class="tab__button"
          to="/home/timeline"
        >
          <span>{{ $t("timeline") }}</span>
        </RouterLink>
        <RouterLink
          class="tab__button"
          to="/home/my"
        >
          <span>{{ $t("myFeeds") }}</span>
        </RouterLink>
        <RouterLink
          class="tab__button"
          to="/home/globalline"
        >
          <span>{{ $t("globalline") }}</span>
        </RouterLink>
      </div>
      <PortalTarget name="home-view-header-bottom" />
    </Portal>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
