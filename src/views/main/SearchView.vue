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
          :title="$t('postSearch')"
        >
          <SVGIcon name="post" />
        </RouterLink>

        <!-- フィード検索ページ -->
        <RouterLink
          class="tab__button"
          :to="`/search/feed${state.query}`"
          :title="$t('feedSearch')"
        >
          <SVGIcon name="feed" />
        </RouterLink>

        <!-- ユーザー検索ページ -->
        <RouterLink
          class="tab__button"
          :to="`/search/user${state.query}`"
          :title="$t('userSearch')"
        >
          <SVGIcon name="person" />
        </RouterLink>

        <!-- トレンドタグページ -->
        <RouterLink
          class="tab__button"
          to="/search/trend-tags"
          :title="$t('trendTags')"
        >
          <SVGIcon name="hash" />
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

.tab__button {
  font-size: 1.25rem;
}
</style>
