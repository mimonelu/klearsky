<script lang="ts" setup>
import { computed, inject, reactive, watch, type ComputedRef, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import Feed from "@/components/compositions/Feed.vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import LoadButton from "@/components/buttons/LoadButton.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"
import UserSlider from "@/components/compositions/UserSlider.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

const state = reactive<{
  starterPack: Ref<undefined | TIStarterPack>
  users: ComputedRef<undefined | Array<TTUser>>
}>({
  starterPack: computedAsync(async () => {
    const uri = mainState.currentQuery.uri
    if (uri == null || !Util.isStarterPackAtUri(uri)) {
      return
    }

    // 指定されたスターターパックを現在のプロフィールユーザーのスターターパックリストから検索
    /*
    let starterPack: undefined | Error | TIStarterPack =
      // WANT: 後日再検証
      // getStarterPack と getActorStarterPacks のレスポンスの乖離が激しいため
      // 一時的かつ強制的に getStarterPack を走らせている
      undefined
      // mainState.currentAuthorStarterPacks.find((starterPack: TIStarterPack) => {
      //   return starterPack.uri === uri
      // })
    */

    // 上記になければ取得（ページ更新時は取得確定）
    if (mainState.currentStarterPack?.uri !== uri) {
      if (mainState.currentStarterPack?.uri !== mainState.currentQuery.uri) {
        mainState.currentStarterPackListFeeds.splice(0)
        mainState.currentStarterPackListFeedsCursor = undefined
      }

      mainState.centerLoaderDisplay = true
      const starterPack: undefined | Error | TIStarterPack = await mainState.atp.fetchStarterPack(uri)
      mainState.centerLoaderDisplay = false
      if (starterPack == null || starterPack instanceof Error) {
        mainState.openErrorPopup("errorApiFailed", "StarterPackView/fetchStarterPack")
        return
      }
      mainState.currentStarterPack = starterPack

      await fetchFeeds("new")
    }

    return mainState.currentStarterPack
  }),
  users: computed((): undefined | Array<TTUser> => {
    if (state.starterPack == null) {
      return
    }
    return state.starterPack.listItemsSample?.map((listItem) => {
      return listItem.subject
    })
  }),
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
      if (feed.post?.cid === newPost.cid)
        Util.updatePostProps(feed.post, newPost)
      if (feed.reply?.parent?.cid === newPost.cid)
        Util.updatePostProps(feed.reply.parent, newPost)
      if (feed.reply?.root?.cid === newPost.cid)
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

// インフィニットスクロール
watch(() => mainState.scrolledToBottom, (value: boolean) => {
  if (value) fetchFeeds("old")
})
</script>

<template>
  <div class="starter-pack-view">
    <!-- スターターパックカード -->
    <StarterPackCard
      :starterPack="state.starterPack"
      :menuDisplay="true"
      :detailDisplay="true"
      :creatorDisplay="true"
      :unclickable="false"
    />

    <template v-if="!mainState.centerLoaderDisplay">
      <template v-if="(state.starterPack?.feeds?.length ?? 0) > 0">
        <div class="strike-header">
          <span>{{ $t("feeds") }}</span>
        </div>

        <!-- スターターパックフィードカード -->
        <div class="starter-pack-view__feed-card-container">
          <FeedCard
            v-for="generator of state.starterPack?.feeds"
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
        <UserSlider :users="state.users" />
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
  </div>
</template>

<style lang="scss" scoped>
.starter-pack-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  .strike-header {
    margin: 0 1rem;
  }

  .user-slider {
    margin: 1rem 1rem 0;
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
    color: var(--fg-color-05);
    font-weight: bold;
    position: relative;
    white-space: nowrap;
  }

  &::before,
  &::after {
    content: "";
    background-color: var(--fg-color-025);
    display: block;
    position: relative;
    top: 50%;
    width: 100%;
    height: 1px;
  }
}
</style>
