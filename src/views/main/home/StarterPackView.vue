<script lang="ts" setup>
import { computed, inject, onMounted, reactive, type ComputedRef } from "vue"
import { type RouteLocationRaw } from "vue-router"
import Feed from "@/components/compositions/Feed.vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import ScrollObserver from "@/components/next/ScrollObserver/Main.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"
import UserSlider from "@/components/compositions/UserSlider.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  users: ComputedRef<undefined | Array<TTUser>>
  listLocation: ComputedRef<undefined | RouteLocationRaw>
}>({
  users: computed((): undefined | Array<TTUser> => {
    return mainState.currentStarterPack?.listItemsSample?.map((listItem) => {
      return listItem.subject
    })
  }),
  listLocation: computed((): undefined | RouteLocationRaw => {
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
  }),
})

onMounted(async () => {
  const uri = mainState.currentQuery.uri
  if (uri == null ||
      !Util.isStarterPackAtUri(uri) ||
      mainState.currentStarterPack?.uri === uri
  ) {
    return
  }

  mainState.currentStarterPack = undefined
  mainState.centerLoaderDisplay = true
  const starterPack = await mainState.atp.fetchStarterPack(uri)
  mainState.centerLoaderDisplay = false
  if (starterPack instanceof Error) {
    mainState.openErrorPopup(starterPack, "StarterPackView/fetchStarterPack")
    return
  }
  mainState.currentStarterPack = starterPack

  mainState.currentStarterPackListFeeds.splice(0)
  await fetchFeeds("new")
})

async function fetchFeeds (direction: TTDirection, middleCursor?: string) {
  Util.blurElement()
  mainState.listLoaderDisplay = true
  await mainState.fetchCurrentStarterPackListFeeds(direction, middleCursor)
  mainState.listLoaderDisplay = false
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
    !mainState.listLoaderDisplay
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

    <template v-if="!mainState.centerLoaderDisplay">
      <template v-if="(mainState.currentStarterPack?.feeds?.length ?? 0) > 0">
        <div class="strike-header">
          <span>{{ $t("feeds") }}</span>
        </div>

        <!-- スターターパックフィードカード -->
        <div class="starter-pack-view__feed-card-container">
          <FeedCard
            v-for="generator of mainState.currentStarterPack?.feeds"
            :generator="generator"
            :menuDisplay="true"
            :detailDisplay="false"
            :orderButtonDisplay="false"
            :creatorDisplay="true"
            :unclickable="false"
          />
        </div>
      </template>

      <template v-if="(state.users?.length ?? 0) > 0">
        <div class="strike-header">
          <span>{{ $t("users") }}</span>
        </div>

        <!-- スターターパックリストユーザースライダー -->
        <UserSlider
          :users="state.users"
          :showMoreButton="mainState.currentStarterPack?.record.list != null"
          :moreLocation="state.listLocation"
        />
      </template>

      <!-- スターターパックリストフィード -->
      <LoadButton
        direction="new"
        :processing="mainState.listLoaderDisplay"
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
