<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/shell-parts/PageHeader.vue"

const mainState = inject("state") as MainState

const state = reactive<{
  query: ComputedRef<string>
}>({
  query: computed((): string => {
    return mainState.currentSearchTerm
      ? `?text=${mainState.currentSearchTerm}`
      : ""
  }),
})
</script>

<template>
  <div class="search-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('search')"
        :subTitle="mainState.atp.session?.__serviceName ?? ''"
      />
      <div class="tab">
        <RouterLink
          class="tab__button"
          :to="`/search/post${state.query}`"
        >
          <span>{{ $t("postSearch") }}</span>
        </RouterLink>
        <RouterLink
          class="tab__button"
          :to="`/search/feed${state.query}`"
        >
          <span>{{ $t("feedSearch") }}</span>
        </RouterLink>
        <RouterLink
          class="tab__button"
          :to="`/search/user${state.query}`"
        >
          <span>{{ $t("users") }}</span>
        </RouterLink>
      </div>
      <div class="search-view__form">
        <PortalTarget name="search-view-header" />
      </div>
    </Portal>
    <RouterView class="child-view" />
  </div>
</template>

<style lang="scss" scoped>
.search-view__form {
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
  border-bottom: 1px solid var(--fg-color-025);

  &:deep() {
    & > form {
      display: grid;
      padding: 1rem;
    }
  }
}

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
