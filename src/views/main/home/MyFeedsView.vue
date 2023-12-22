<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/list/FeedList.vue"
import LazyImage from "@/components/common/LazyImage.vue"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function updateMyFeeds () {
  Util.blurElement()
  if (mainState.listProcessing) return
  mainState.listProcessing = true
  await mainState.fetchMyFeeds()
  mainState.listProcessing = false
}

function openMyFeedsPopup () {
  Util.blurElement()
  mainState.openMyFeedsPopup()
}
</script>

<template>
  <div class="my-feeds-view">
    <Portal to="home-view-header-top">
      <button @click.stop="updateMyFeeds">
        <SVGIcon name="refresh" />
      </button>

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
        @click.stop="mainState.openMyListPopup"
      >
        <SVGIcon name="list" />
      </button>
    </Portal>

    <!-- マイフィード未取得エラーラベル -->
    <div
      v-if="!mainState.listProcessing && Object.keys(mainState.currentMyFeeds).length === 0"
      class="textlabel"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noMyFeeds") }}
      </div>
    </div>

    <div
      v-for="myFeeds, uri in mainState.currentMyFeeds"
      :key="uri"
      class="my-feeds-view__item"
    >
      <RouterLink
        class="my-feeds-view__header"
        :to="{
          path: '/home/feeds',
          query: {
            feed: myFeeds.generator?.uri,
            displayName: myFeeds.generator?.displayName,
          },
        }"
      >
        <LazyImage :src="myFeeds.generator?.avatar" />
        <span>{{ myFeeds.generator?.displayName }}</span>
        <SVGIcon name="cursorRight" />
      </RouterLink>
      <Loader v-if="myFeeds.processing" />

      <!-- カスタムフィードの取得エラーラベル -->
      <div
        v-else-if="!myFeeds.status"
        class="textlabel"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("errorMessage") }}
        </div>
      </div>

      <template v-else>
        <div class="my-feeds-view__body">
          <FeedList
            type="feeds"
            :feeds="myFeeds.feeds"
            :hasLoadButton="false"
            :disabledInfinitScroll="true"
          />
        </div>
        <div
          v-if="myFeeds.feeds.length >= 2"
          class="my-feeds-view__link"
        >
          <RouterLink
            class="button--plane"
            :to="{ path: '/home/feeds', query: {
              feed: myFeeds.generator?.uri,
              displayName: myFeeds.generator?.displayName,
            } }"
          >
            <SVGIcon name="cursorRight" />
            <span>{{ $t("more") }} - {{ myFeeds.generator?.displayName }}</span>
          </RouterLink>
        </div>
      </template>
    </div>
    <Loader v-if="mainState.listProcessing" />
  </div>
</template>

<style lang="scss" scoped>
.my-feeds-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding-bottom: var(--sp-menu-height);
  position: relative;

  &__header {
    background-color: rgb(var(--bg-color), var(--main-area-opacity));
    border-bottom: 1px solid var(--fg-color-025);
    cursor: pointer;
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 0 1rem;
    position: sticky;
    top: 6rem;
    min-height: 3rem;
    max-height: 3rem;
    z-index: 1;

    & > .lazy-image {
      border-radius: 1px;
      overflow: hidden;
      min-width: 1.75em;
      max-width: 1.75em;
      min-height: 1.75em;
      max-height: 1.75em;
    }

    & > span {
      color: rgb(var(--accent-color));
      font-size: 1.25rem;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & > .svg-icon--cursorRight {
      fill: var(--fg-color-05);
    }
    &:focus, &:hover {
      & > .svg-icon--cursorRight {
        fill: rgb(var(--fg-color));
      }
    }
  }

  &__item {
    border-bottom: 1px solid var(--fg-color-025);
    position: relative;

    .loader {
      position: relative;
      z-index: 0;
      height: 3rem;
    }

    .textlabel {
      margin: 1rem;
    }
  }

  & > .textlabel {
    margin: 2rem;
  }

  &__link {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.5em;
  }
}

.feed-list:deep() {
  .feed:not(:last-child) {
    border-bottom: 1px solid var(--fg-color-0125);
  }

  .feed:not(:empty):not(:last-child)::after {
    border-bottom-style: none;
  }
}
</style>
