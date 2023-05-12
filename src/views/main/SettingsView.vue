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
        >{{ $t("klearskySettings") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/settings/bluesky"
        >{{ $t("blueskySettings") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/settings/account"
        >{{ $t("accountSettings") }}</RouterLink>
      </div>
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.settings-view {
  padding-bottom: 8rem;

  &__header {
    position: sticky;
    top: var(--top-border-width);
    z-index: 1;
  }
}

.tab__button {
  width: 50%;
}
</style>
