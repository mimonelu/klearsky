<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/shells/PageHeader.vue"
import PageHeaderButtons from "@/components/shells/PageHeaderButtons.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

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
      >
        <template #right>
          <PageHeaderButtons />
        </template>
      </PageHeader>
      <div class="tab">
        <!-- ポスト検索ページ -->
        <RouterLink
          class="tab__button"
          :to="`/search/post${state.query}`"
        >
          <span>{{ $t("postSearch") }}</span>
        </RouterLink>

        <!-- フィード検索ページ -->
        <RouterLink
          class="tab__button"
          :to="`/search/feed${state.query}`"
        >
          <span>{{ $t("feedSearch") }}</span>
        </RouterLink>

        <!-- ユーザー検索ページ -->
        <RouterLink
          class="tab__button"
          :to="`/search/user${state.query}`"
        >
          <span>{{ $t("users") }}</span>
        </RouterLink>

        <!-- タグ付けされた提案ページ -->
        <RouterLink
          class="tab__button tab__button--tagged-suggestions"
          to="/search/tagged-suggestions"
        >
          <SVGIcon name="fire" />
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
.search-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__form {
    background-color: rgb(var(--bg-color), var(--main-area-opacity));
    display: flex;
    grid-gap: 0.5rem;
    padding: 0.5rem;
    &:empty {
      display: none;
    }

    &:deep() {
      form {
        display: grid;
        flex-grow: 1;
      }

      .svg-icon {
        font-size: 1.25rem;
      }
    }
  }
}

.child-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

// タグ付けされた提案ページ
.tab__button--tagged-suggestions > .svg-icon {
  --fg-color: 255, 0, 0;
  font-size: 1.5rem;
}
</style>
