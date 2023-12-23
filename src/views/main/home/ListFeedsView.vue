<script lang="ts" setup>
import { inject, onMounted, watch } from "vue"
import Feed from "@/components/app-parts/Feed.vue"
import ListCard from "@/components/list/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

onMounted(() => {
  // `await` は不要
  if (mainState.currentList == null) {
    // mainState.fetchList("new", 1)
  }
})

async function fetchFeeds (direction: "new" | "old", middleCursor?: string) {
  Util.blurElement()
  mainState.listProcessing = true
  await mainState.fetchListFeeds(direction, middleCursor)
  mainState.listProcessing = false
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchFeeds("old")
})
</script>

<template>
  <div class="list-feeds">
    <Portal to="home-view-header-top">
      <!-- マイリストポップアップトリガー -->
      <button
        class="my-list-trigger"
        @click.stop="mainState.openMyListPopup"
      >
        <SVGIcon name="list" />
      </button>
    </Portal>
    <ListCard
      v-if="mainState.currentList"
      :list="mainState.currentList"
      :createDisplay="true"
      :unclickable="true"
    />
    <div
      v-else
      class="list-feeds__list-card-skeleton"
    />
    <LoadButton
      direction="new"
      :processing="mainState.listProcessing"
      @activate="fetchFeeds('new')"
    />
    <div class="feeds">
      <template
        v-for="feed of mainState.currentListFeeds"
        :key="feed.__id"
      >
        <Feed
          :feed="feed"
          :data-is-middle="feed.__cursor != null"
        />

        <!-- 抜け漏れ取得ボタン -->
        <LoadButton
          v-if="feed.__cursor != null"
          direction="middle"
          :processing="mainState.listProcessing"
          @activate="fetchFeeds('old', feed.__cursor)"
        />
      </template>
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listProcessing"
      @activate="fetchFeeds('old')"
    />
  </div>
</template>

<style lang="scss" scoped>
.list-feeds {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  &__list-card-skeleton {
    border-bottom: 1px solid var(--fg-color-025);
    min-height: 8rem;
  }
}

.list-card {
  border-bottom: 1px solid var(--fg-color-025);
}

.feeds {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed {
  display: flex;
  flex-direction: column;
  &:not(:empty):not(:last-child)::after {
    border-bottom: 1px solid var(--fg-color-0125);
    content: "";
    display: block;
  }
}
</style>
