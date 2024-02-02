<script lang="ts" setup>
import { inject } from "vue"
import LazyImage from "@/components/common/LazyImage.vue"
import PageHeader from "@/components/shell-parts/PageHeader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

function openMyFeedsPopup () {
  Util.blurElement()
  mainState.openMyFeedsPopup()
}

function openMyListPopup () {
  Util.blurElement()
  mainState.openMyListPopup()
}
</script>

<template>
  <div class="home-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('home')"
      >
        <template #right>
          <PortalTarget name="home-view-header-top" />

          <!-- マイフィードポップアップトリガー -->
          <button
            class="my-feeds-trigger"
            @click.stop="openMyFeedsPopup"
          >
            <SVGIcon name="feed" />
          </button>

          <!-- マイリストポップアップトリガー -->
          <button
            class="my-list-trigger"
            @click.stop="openMyListPopup"
          >
            <SVGIcon name="list" />
          </button>
        </template>
      </PageHeader>

      <!-- スライダーメニュー -->
      <div class="slider-menu">
        <template
          v-for="item of mainState.myFeeds.pinnedItems"
          :key="item.value.uri"
        >
          <!-- フォロー中フィード -->
          <RouterLink
            v-if="item.kind === 'followings'"
            class="slider-menu__link"
            to="/home/timeline"
            :data-is-selected="true"
          >
            <SVGIcon name="shimmer" />
            <span>{{ $t(item.value.displayName) }}</span>
          </RouterLink>

          <!-- グローバルライン -->
          <RouterLink
            v-else-if="item.kind === 'globalline'"
            class="slider-menu__link"
            to="/home/globalline"
            :data-is-selected="true"
          >
            <SVGIcon name="shimmer" />
            <span>{{ $t(item.value.displayName) }}</span>
          </RouterLink>

          <!-- カスタムフィード -->
          <RouterLink
            v-else-if="item.kind === 'feed' && !!item.value.cid"
            class="slider-menu__link"
            :to="{
              path: '/home/feeds',
              query: {
                feed: item.value.uri,
                displayName: item.value.displayName,
              },
            }"
            :data-is-selected="mainState.currentQuery.feed === item.value.uri"
          >
            <LazyImage :src="item.value.avatar" />
            <span>{{ item.value.displayName }}</span>
          </RouterLink>

          <!-- リストフィード -->
          <RouterLink
            v-else-if="item.kind === 'list' && !!item.value.cid"
            class="slider-menu__link"
            :to="{
              path: '/home/list-feeds',
              query: {
                list: item.value.uri,
                displayName: item.value.name,
              },
            }"
            :data-is-selected="mainState.currentQuery.list === item.value.uri"
          >
            <LazyImage :src="item.value.avatar" />
            <span>{{ item.value.name }}</span>
          </RouterLink>
        </template>
      </div>

      <PortalTarget name="home-view-header-bottom" />
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

.slider-menu {
  background-color: rgb(var(--bg-color));
  border-bottom: 1px solid var(--fg-color-025);
  display: flex;
  align-items: center;
  overflow-x: auto;
  @include scroll-bar();

  &::before {
    content: "";
    display: block;
    height: 3rem;
  }

  &__link {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;
    padding: 0 0.75rem;
    max-width: 12rem;
    min-height: 3rem;
    max-height: 3rem;
    --color: var(--fg-color-075);
    &:focus, &:hover {
      --color: rgb(var(--fg-color));
    }
    &.router-link-active[data-is-selected="true"] {
      background-color: var(--accent-color-025);
    }

    .svg-icon--shimmer,
    .lazy-image {
      border-radius: 1px;
      overflow: hidden;
      min-width: 1.5em;
      max-width: 1.5em;
      min-height: 1.5em;
      max-height: 1.5em;
    }

    .svg-icon--shimmer {
      fill: var(--fg-color-05);
    }

    & > span {
      color: var(--color);
      cursor: pointer;
      display: block;
      font-weight: bold;
      line-height: var(--line-height);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
