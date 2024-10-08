<script lang="ts" setup>
import { inject } from "vue"
import Feed from "@/components/compositions/Feed.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  type:
    "authorFeeds" |
    "authorFeedsWithReplies" |
    "authorReposts" |
    "authorLikes" |
    "feeds" |
    "post" |
    "timeline"
  feeds: null | Array<TTFeed>
  hasLoadButton?: boolean
  disabledInfinitScroll?: boolean
}>()

const mainState = inject("state") as MainState

async function fetchFeeds (direction: TTDirection, middleCursor?: string) {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  try {
    switch (props.type) {
      case "authorFeeds": {
        await mainState.fetchCurrentAuthorFeed(direction, undefined, middleCursor)
        break
      }
      case "authorFeedsWithReplies": {
        await mainState.fetchCurrentAuthorFeed(direction, "posts_with_replies", middleCursor)
        break
      }
      case "authorReposts": {
        await mainState.fetchAuthorReposts(direction)
        break
      }
      case "authorLikes": {
        await mainState.fetchAuthorLikes(direction)
        break
      }
      case "feeds": {
        await mainState.fetchCustomFeeds(middleCursor != null ? "middle" : direction, middleCursor)
        break
      }
      case "post": {
        await mainState.fetchPostThread()
        break
      }
      case "timeline": {
        await mainState.fetchTimeline(middleCursor != null ? "middle" : direction, middleCursor)
        break
      }
    }
  } finally {
    mainState.listLoaderDisplay = false
  }
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  // MEMO: 全フィードの全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  props.feeds?.forEach((feed: TTFeed) => {
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
  props.feeds?.forEach((feed: TTFeed) => {
    // @ts-ignore // TODO:
    if (feed.post?.uri === uri) delete feed.post
    // @ts-ignore // TODO:
    if (feed.reply?.parent?.uri === uri) delete feed.reply.parent
    // @ts-ignore // TODO:
    if (feed.reply?.root?.uri === uri) delete feed.reply.root
  })
}

function onScrolledToBottom () {
  if (
    mainState.atp.hasLogin() &&
    !mainState.listLoaderDisplay &&
    !props.disabledInfinitScroll
  ) {
    fetchFeeds("old")
  }
}
</script>

<template>
  <div class="feed-list">
    <LoadButton
      v-if="hasLoadButton"
      direction="new"
      :processing="mainState.listLoaderDisplay"
      @activate="fetchFeeds('new')"
    />
    <div class="feeds">
      <!-- 空のコンテンツメッセージ -->
      <div
        v-if="!mainState.listLoaderDisplay && feeds?.length === 0"
        class="textlabel margin1"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("noPostsInFeed") }}
        </div>
      </div>

      <template
        v-for="feed of feeds"
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
      v-if="hasLoadButton"
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
.feed-list {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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
