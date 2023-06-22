<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="settings-view">
    <div class="settings-view__header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('settings')"
        :subTitle="mainState.atp.session?.handle ?? ''"
      />
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.settings-view {
  padding-bottom: var(--sp-menu-height);

  &__header {
    position: sticky;
    top: 0;
    z-index: 1;
  }
}

.tab__button {
  width: 50%;
}
</style>
