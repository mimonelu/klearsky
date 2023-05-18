<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="search-view">
    <div class="search-view__header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('search')"
        :subTitle="mainState.atp.session?.__service ?? ''"
      />
      <div class="tab">
        <RouterLink
          class="tab__button"
          to="/search/suggestion"
        >{{ $t("suggestionSearch") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/search/user"
        >{{ $t("userSearch") }}</RouterLink>
        <RouterLink
          class="tab__button"
          to="/search/keyword"
        >{{ $t("keywordSearch") }}</RouterLink>
      </div>
    </div>
    <RouterView class="child-view" />
  </div>
</template>

<style lang="scss" scoped>
.search-view {
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

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
