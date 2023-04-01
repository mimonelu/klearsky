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

function updateThisPost (newPosts: Array<TTPost>) {
  if (props.feeds == null) return

  // MEMO: フィード内の全同一ポストに最新のデータを反映する
  // WANT: このために「画面には1つのフィードのみ表示する」としているが、何とかしたい
  props.feeds.forEach((feed: TTFeed) => {
    newPosts.forEach((newPost: TTPost) => {
      if (feed.post?.cid === newPost.cid) {
        feed.post = newPost
      }
      if (feed.reply?.parent?.cid === newPost.cid) {
        feed.reply.parent = newPost
      }
      if (feed.reply?.root?.cid === newPost.cid) {
        feed.reply.root = newPost
      }
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
            v-if="feed.reply?.root != null && feed.reply.root.cid !== feed.reply.parent?.cid"
            type="root"
            :post="feed.reply.root"
            :data-has-child="feed.reply.root.cid === feed.reply?.parent?.record.reply?.parent?.cid"
            @updateThisPost="updateThisPost"
            @removeThisPost="removeThisPost"
          />
          <Post
            v-if="feed.reply?.parent != null"
            type="parent"
            :post="feed.reply.parent"
            :data-has-child="feed.reply.parent.cid === feed.post.record.reply?.parent?.cid"
            @updateThisPost="updateThisPost"
            @removeThisPost="removeThisPost"
          />
        </template>
        <Post
          v-if="feed.post != null"
          type="post"
          :post="feed.post"
          :replyTo="feed.reply?.parent"
          @onClickReplier="feed.__replyDisplay = !feed.__replyDisplay"
          @updateThisPost="updateThisPost"
          @removeThisPost="removeThisPost"
        />
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
  &:not(:empty):not(:last-child)::after {
    border-bottom: 1px solid rgba(var(--fg-color), 0.125);
    content: "";
    display: block;
    margin: 0 1rem;
  }
}

.post[data-has-child="true"] {
  &::before {
    border-left: 2px solid rgba(var(--fg-color), 0.25);
    content: "";
    display: block;
    position: absolute;
    top: calc(1em + var(--avatar-size) + 8px);
    left: calc(2.5em - 1px);
    width: 0;
    height: calc(100% - var(--avatar-size) - 16px);
  }
}
</style>
