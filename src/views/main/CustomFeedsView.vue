<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState

function openCustomFeedsPopup () {
  mainState.openCustomFeedsPopup()
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
            @click.stop="openCustomFeedsPopup"
          >
            <SVGIcon name="setting" />
          </button>
        </template>
      </PageHeader>
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
  }
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
