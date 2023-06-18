<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/FeedList.vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function updateMyFeeds () {
  Util.blurElement()
  if (mainState.listProcessing) return
  mainState.listProcessing = true
  await mainState.fetchMyFeeds()
  mainState.listProcessing = false
}
</script>

<template>
  <div class="my-feeds-view">
    <Portal to="custom-feeds-view-header-portal">
      <button
        class="button--bordered"
        @click.stop="updateMyFeeds"
      >
        <SVGIcon name="repost" />
      </button>
    </Portal>
    <div
      v-if="!mainState.listProcessing && Object.keys(mainState.currentMyFeeds).length === 0"
      class="textlabel"
    >
      <div class="textlabel__text">
        <SVGIcon name="alert" />{{ $t("noMyFeeds") }}
      </div>
    </div>
    <template v-else>
      <div
        v-for="myFeeds, uri in mainState.currentMyFeeds"
        :key="uri"
        v-show="!mainState.listProcessing"
        class="my-feeds-view__item"
      >
        <RouterLink
          class="my-feeds-view__header"
          :to="{ path: '/feeds/timeline', query: {
            feed: myFeeds.generator?.uri,
            displayName: myFeeds.generator?.displayName,
          } }"
        >
          <SVGIcon name="rss" />
          <span>{{ myFeeds.generator?.displayName }}</span>
          <SVGIcon name="cursorRight" />
        </RouterLink>
        <div class="my-feeds-view__body">
          <FeedList
            type="feeds-timeline"
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
            :to="{ path: '/feeds/timeline', query: {
              feed: myFeeds.generator?.uri,
              displayName: myFeeds.generator?.displayName,
            } }"
          >
            <SVGIcon name="cursorRight" />
            <span>{{ $t("more") }} - {{ myFeeds.generator?.displayName }}</span>
          </RouterLink>
        </div>
      </div>
    </template>
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
    background-color: rgba(var(--bg-color), var(--main-area-opacity));
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
    cursor: pointer;
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 1rem;
    position: sticky;
    top: calc(6rem + 1px);
    z-index: 1;

    & > .svg-icon--rss {
      fill: rgb(var(--accent-color));
    }

    & > span {
      color: rgb(var(--accent-color));
      font-size: 1.25rem;
      font-weight: bold;
      margin: -1rem 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & > .svg-icon--cursorRight {
      fill: rgba(var(--fg-color), 0.5);
    }
    &:focus, &:hover {
      & > .svg-icon--cursorRight {
        fill: rgb(var(--fg-color));
      }
    }
  }

  &__item {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  }

  .textlabel {
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
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  }

  .feed:not(:empty):not(:last-child)::after {
    border-bottom-style: none;
  }
}
</style>
