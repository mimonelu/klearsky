<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState

function openMyFeedsPopup () {
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
          <button
            class="button--bordered"
            @click.stop="openMyFeedsPopup"
          >
            <SVGIcon name="setting" />
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
    z-index: 1;

    .button--bordered {
      margin: -1rem 0;
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
