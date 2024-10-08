<script lang="ts" setup>
import { inject } from "vue"
import Feed from "@/components/compositions/Feed.vue"
import ListCard from "@/components/cards/ListCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
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
  if (!mainState.myLists!.remove(list.uri)) return

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  // MEMO: 全フィードの全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  mainState.currentListFeeds?.forEach((feed: TTFeed) => {
    newPosts.forEach((newPost: TTPost) => {
      if (feed.post?.uri === newPost.uri)
        Util.updatePostProps(feed.post, newPost)
      if (feed.reply?.parent?.uri === newPost.uri)
        Util.updatePostProps(feed.reply.parent, newPost)
      if (feed.reply?.root?.uri === newPost.uri)
        Util.updatePostProps(feed.reply.root, newPost)
    })
  })
}

function removeThisPost (uri: string) {
  mainState.currentListFeeds?.forEach((feed: TTFeed) => {
    // @ts-ignore // TODO:
    if (feed.post?.uri === uri) delete feed.post
    // @ts-ignore // TODO:
    if (feed.reply?.parent?.uri === uri) delete feed.reply.parent
    // @ts-ignore // TODO:
    if (feed.reply?.root?.uri === uri) delete feed.reply.root
  })
}

// スクロールオブザーバー
function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay
  ) {
    fetchFeeds("old")
  }
}
</script>

<template>
  <div class="list-feeds">
    <ListCard
      v-if="mainState.currentList"
      :list="mainState.currentList"
      :menuDisplay="true"
      :detailDisplay="false"
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
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
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

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
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
