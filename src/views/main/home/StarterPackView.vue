<script lang="ts" setup>
import { computed, inject, reactive } from "vue"
import { type RouteLocationRaw } from "vue-router"
import Feed from "@/components/compositions/Feed.vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import Loader from "@/components/shells/Loader.vue"
import ScrollObserver from "@/components/next/ScrollObserver/ScrollObserver.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UserSlider from "@/components/compositions/UserSlider.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

// 追加読み込み中フラグ
// 初回の読み込み中は `mainState.listLoaderDisplay` （ `processPage()` が管理）
const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

// 初回の読み込み中または追加読み込み中
const listLoading = computed((): boolean => {
  return mainState.listLoaderDisplay || state.processing
})

const users = computed((): undefined | Array<TTUser> => {
  return mainState.currentStarterPack?.listItemsSample?.map((listItem) => {
    return listItem.subject
  })
})

const listLocation = computed((): undefined | RouteLocationRaw => {
  if (mainState.currentStarterPack == null) {
    return
  }
  return {
    name: 'list-users-home',
    query: {
      list: mainState.currentStarterPack?.list?.uri ?? mainState.currentStarterPack?.record.list,
      displayName: mainState.currentStarterPack?.record.name,
    },
  }
})

async function fetchFeeds (direction: TTDirection, middleCursor?: string) {
  Util.blurElement()
  state.processing = true
  await mainState.fetchCurrentStarterPackListFeeds(direction, middleCursor)
  state.processing = false
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  // MEMO: 全フィードの全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  mainState.currentStarterPackListFeeds?.forEach((feed: TTFeed) => {
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
  mainState.currentStarterPackListFeeds?.forEach((feed: TTFeed) => {
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
    !listLoading.value
  ) {
    fetchFeeds("old")
  }
}
</script>

<template>
  <div class="starter-pack-view">
    <!-- スターターパックカード -->
    <StarterPackCard
      :starterPack="mainState.currentStarterPack"
      :menuDisplay="true"
      :detailDisplay="true"
      :creatorDisplay="true"
      :unclickable="false"
    />

    <!-- スターターパックのローダー -->
    <Loader v-if="mainState.currentStarterPack == null && mainState.listLoaderDisplay" />

    <template v-if="mainState.currentStarterPack != null">
      <!-- フィード -->
      <template v-if="(mainState.currentStarterPack?.feeds?.length ?? 0) > 0">
        <!-- フィード - ヘッダー -->
        <div class="strike-header">
          <span>{{ $t("feeds") }}</span>
        </div>

        <!-- フィード - スターターパックフィードカード -->
        <div class="starter-pack-view__feed-card-container">
          <FeedCard
            v-for="generator of mainState.currentStarterPack?.feeds"
            :key="generator.uri"
            :generator="generator"
            :menuDisplay="true"
            :detailDisplay="false"
            :orderButtonDisplay="false"
            :creatorDisplay="true"
            :unclickable="false"
          />
        </div>
      </template>

      <!-- ユーザー -->
      <template v-if="(users?.length ?? 0) > 0">
        <!-- ユーザー - ヘッダー -->
        <div class="strike-header">
          <span>{{ $t("users") }}</span>
        </div>

        <!-- ユーザー - スターターパックリストユーザースライダー -->
        <UserSlider
          :users="users"
          :showMoreButton="mainState.currentStarterPack?.record.list != null"
          :moreLocation="listLocation"
        />
      </template>

      <!-- スターターパックリストユーザーへのリンク -->
      <div
        v-if="listLocation != null"
        class="link-to-list-users"
      >
        <RouterLink
          class="textlink--icon"
          :to="listLocation"
        >
          <SVGIcon name="cursorRight" />
          <span>{{ $t("showStarterPackListUsers") }}</span>
        </RouterLink>
      </div>

      <!-- スターターパックリストフィード -->
      <LoadButton
        direction="new"
        :processing="listLoading"
        @activate="fetchFeeds('new')"
      />
      <div class="starter-pack-view__feed-container">
        <template
          v-for="feed of mainState.currentStarterPackListFeeds"
          :key="feed.__id"
        >
          <Feed
            :feed="feed"
            :data-is-middle="feed.__cursor != null"
            @updateThisPostThread="updateThisPostThread as unknown"
            @removeThisPost="removeThisPost as unknown"
          />

          <!-- 抜け漏れ取得ボタン -->
          <LoadButton
            v-if="feed.__cursor != null"
            direction="middle"
            :processing="listLoading"
            @activate="fetchFeeds('middle', feed.__cursor)"
          />
        </template>
      </div>
      <LoadButton
        direction="old"
        :processing="listLoading"
        @activate="fetchFeeds('old')"
      />
    </template>

    <!-- スクロールオブザーバー -->
    <ScrollObserver
      :isWindow="true"
      @scrolledToBottom="onScrolledToBottom"
    />
  </div>
</template>

<style lang="scss" scoped>
.starter-pack-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .user-slider {
    margin-top: 1rem;
    padding: 0 0.5rem;
  }

  &__feed-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }
}

// スターターパックリストユーザーへのリンク
.link-to-list-users {
  text-align: right;

  & > a {
    padding: 0.5rem;
  }
}

// ヘッダー
.strike-header {
  display: flex;
  grid-gap: 1rem;
  justify-content: center;
  position: relative;

  & > span {
    color: rgb(var(--fg-color), 0.5);
    font-weight: bold;
    position: relative;
    white-space: nowrap;
  }

  &::before,
  &::after {
    content: "";
    background-color: rgb(var(--fg-color), 0.25);
    display: block;
    position: relative;
    top: 50%;
    width: 100%;
    height: 1px;
  }
}
</style>
