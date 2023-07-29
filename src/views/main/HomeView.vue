<script lang="ts" setup>
import PageHeader from "@/components/PageHeader.vue"
</script>

<template>
  <div class="home-view">
    <div class="home-view__header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('home')"
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
    z-index: 2;
  }
}

.tab__button {
  width: 50%;
}
</style>
