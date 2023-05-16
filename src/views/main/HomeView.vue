<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="home-view">
    <div class="home-view__header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('home')"
        :subTitle="mainState.atp.session?.handle ?? ''"
      />
      <div class="tab">
        <RouterLink
          class="tab__button"
          to="/home/timeline"
        >{{ $t("timeline") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/home/globalline"
        >{{ $t("globalline") }}</RouterLink>
      </div>
    </div>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

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
