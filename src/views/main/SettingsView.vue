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
      <div class="tab">
        <RouterLink
          class="tab__button"
          to="/settings/klearsky"
        >{{ $t("klearsky") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/settings/bluesky"
        >{{ $t("bluesky") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/settings/accounts"
        >{{ $t("accounts") }}</RouterLink>
      </div>
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
