<script lang="ts" setup>
import { inject, watch } from "vue"
import Feed from "@/components/app-parts/Feed.vue"
import ListCard from "@/components/list/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

async function fetchFeeds (direction: TTDirection, middleCursor?: string) {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  await mainState.fetchCurrentListFeeds(direction, middleCursor)
  mainState.listLoaderDisplay = false
}

// マイリストの削除
async function deleteList (list: TTList) {
  if (!mainState.myLists.remove(list.uri)) return

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)
}

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchFeeds("old")
})
</script>

<template>
  <div class="list-feeds">
    <ListCard
      v-if="mainState.currentList"
      :list="mainState.currentList"
      :toggleDisplay="true"
      :orderButtonDisplay="false"
      @deleteList="deleteList"
    />
    <div
      v-else
      class="list-feeds__list-card-skeleton"
    />
    <LoadButton
      direction="new"
      :processing="mainState.listLoaderDisplay"
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
          :processing="mainState.listLoaderDisplay"
          @activate="fetchFeeds('middle', feed.__cursor)"
        />
      </template>
    </div>
    <LoadButton
      direction="old"
      :processing="mainState.listLoaderDisplay"
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
    min-height: 8rem;
  }
}

.feeds {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed {
  display: flex;
  flex-direction: column;
}
</style>
