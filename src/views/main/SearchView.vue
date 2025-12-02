<script lang="ts" setup>
import { computed, inject } from "vue"
import { RouterView } from "vue-router"
import PageHeader from "@/components/shells/PageHeader.vue"
import PageHeaderButtons from "@/components/shells/PageHeaderButtons.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const mainState = inject("state") as MainState

const postQuery = computed((): string => {
  const queries: string[] = []
  if (mainState.currentSearchTerm) {
    queries.push(`text=${mainState.currentSearchTerm}`)
  }
  Object.keys(mainState.currentSearchPostFormState).forEach((key) => {
    const value = (mainState.currentSearchPostFormState as any)[key]
    if (value) {
      queries.push(`${key}=${value}`)
    }
  })
  const query = queries.join("&")
  return query ? `?${query}` : ""
})

const query = computed((): string => {
  return mainState.currentSearchTerm
    ? `?text=${mainState.currentSearchTerm}`
    : ""
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
          :to="`/search/post${postQuery}`"
          :title="$t('postSearch')"
        >
          <SVGIcon name="post" />
        </RouterLink>

        <!-- フィード検索ページ -->
        <RouterLink
          class="tab__button"
          :to="`/search/feed${query}`"
          :title="$t('feedSearch')"
        >
          <SVGIcon name="feed" />
        </RouterLink>

        <!-- ユーザー検索ページ -->
        <RouterLink
          class="tab__button"
          :to="`/search/user${query}`"
          :title="$t('userSearch')"
        >
          <SVGIcon name="person" />
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
    display: flex;
    flex-direction: column;
    grid-gap: 0.5rem;
    padding: 0 0.5rem 0.5rem;
    &:empty {
      display: none;
    }

    &:deep() {
      .group-parts > *:first-child {
        flex-grow: 1;
      }

      .svg-icon--history,
      .svg-icon--setting {
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
