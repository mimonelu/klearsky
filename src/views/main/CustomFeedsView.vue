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
</script>

<template>
  <div class="custom-feeds-view">
    <div class="custom-feeds-view__header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('customFeeds')"
        :subTitle="mainState.currentQuery.displayName"
      >
        <template #right>
          <PortalTarget name="custom-feeds-view-header-portal" />
          <button @click.stop="openMyFeedsPopup">
            <SVGIcon name="rss" />
          </button>
        </template>
      </PageHeader>
      <div class="tab">
        <RouterLink
          class="tab__button"
          to="/feeds/my"
        >{{ $t("myFeeds") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/feeds/popular"
        >{{ $t("popularFeeds") }}</RouterLink>
      </div>
    </div>
    <RouterView class="child-view" />
  </div>
</template>

<style lang="scss" scoped>
.custom-feeds-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__header {
    position: sticky;
    top: 0;
    z-index: 2;

    .page-header:deep() {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }

    .tab {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
