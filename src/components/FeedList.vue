<script lang="ts" setup>
import { inject } from "vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const props = defineProps<{
  type: "author" | "post" | "timeline";
  feeds: null | Array<TTFeed>;
  hasFetchButton?: boolean;
}>()

const mainState = inject("state") as MainState

async function fetchFeeds (direction: "new" | "old") {
  blurElement()
  mainState.processing = true
  try {
    switch (props.type) {
      case "author": {
        await mainState.fetchCurrentAuthorFeed(direction)
        break
      }
      case "post": {
        await mainState.fetchPostThread()
        break
      }
      case "timeline": {
        await mainState.fetchTimeline(direction)
        break
      }
    }
  } finally {
    mainState.processing = false
  }
}

function updateThisPost (newFeed: TTFeed) {
  if (props.feeds == null) return

  // MEMO: フィード内の全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  props.feeds?.forEach((feed: TTFeed) => {
    if (feed.post?.cid === newFeed.post.cid) {
      feed.post = newFeed.post
    }
    if (feed.reply?.parent?.cid === newFeed.post.cid) {
      feed.reply.parent = newFeed.post
    }
    if (feed.reply?.root?.cid === newFeed.post.cid) {
      feed.reply.root = newFeed.post
    }
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
</script>

<template>
  <div class="feed-list">
    <button
      v-if="hasFetchButton"
      class="fetch-button"
      @click.prevent="fetchFeeds('new')"
    >
      <SVGIcon name="cursorUp"/>
    </button>
    <div class="feeds">
      <div
        v-for="feed of feeds"
        class="feed"
      >
        <template v-if="feed.__replyDisplay && (feed.reply?.root != null || feed.reply?.parent != null)">
          <Post
            v-if="feed.reply?.root != null"
            type="root"
            :post="feed.reply.root"
            @updateThisPost="updateThisPost"
            @removeThisPost="removeThisPost"
          />
          <Post
            v-if="feed.reply?.parent != null
              && (feed.reply.parent as TTPost)?.cid !== (feed.reply.root as TTPost)?.cid"
            type="parent"
            :post="feed.reply.parent"
            @updateThisPost="updateThisPost"
            @removeThisPost="removeThisPost"
          />
        </template>
        <Post
          v-if="feed.post != null"
          type="post"
          :post="feed.post"
          @updateThisPost="updateThisPost"
          @removeThisPost="removeThisPost"
        >
          <template v-slot:before>
            <div
              v-if="feed.reply?.root != null || feed.reply?.parent != null"
              class="replier"
              @click.stop="feed.__replyDisplay = !feed.__replyDisplay"
            >
              <SVGIcon name="post" />
              <div class="replier__display-name">{{ feed.reply?.parent.author.displayName }}</div>
              <div class="replier__handle">{{ feed.reply?.parent.author.handle }}</div>
            </div>
          </template>
        </Post>
      </div>
    </div>
    <button
      v-if="hasFetchButton"
      class="fetch-button"
      @click.prevent="fetchFeeds('old')"
    >
      <SVGIcon name="cursorDown"/>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.feed-list {
  display: flex;
  flex-direction: column;
}

.feeds {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.feed {
  display: flex;
  flex-direction: column;
  &:not(:empty):not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
  }
}
</style>
