<script lang="ts" setup>
import { inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/shell-parts/PageHeader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="search-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('search')"
        :subTitle="mainState.atp.session?.__service ?? ''"
      />
      <div class="tab">
        <RouterLink
          class="tab__button"
          to="/search/post"
        >
          <span>{{ $t("postSearch") }}</span>
        </RouterLink>
        <RouterLink
          class="tab__button"
          to="/search/feed"
        >
          <span>{{ $t("feedSearch") }}</span>
        </RouterLink>
        <RouterLink
          class="tab__button"
          to="/search/user"
        >
          <span>{{ $t("accounts") }}</span>
        </RouterLink>
      </div>
    </Portal>
    <RouterView class="child-view" />
  </div>
</template>

<style lang="scss" scoped>
.search-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
</style>
