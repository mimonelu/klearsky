<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="custom-feeds-view">
    <div class="custom-feeds-view__header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('customFeeds')"
        :subTitle="mainState.currentQuery.displayName"
      />
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
