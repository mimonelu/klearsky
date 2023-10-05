<script lang="ts" setup>
import { inject } from "vue"
import PageHeader from "@/components/shell-parts/PageHeader.vue"

const mainState = inject("state") as MainState
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
          <PortalTarget name="home-view-header-portal" />
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

.tab__button {
  width: 50%;
}
</style>
