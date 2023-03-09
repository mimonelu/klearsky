<script lang="ts" setup>
import { inject } from "vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import type { MainState } from "@/@types/app.d"
import type { Feed } from "@/composables/atp"

const props = defineProps<{
  type: "timline" | "post";
  feeds: null | Array<Feed>;
  hasFetchButton?: boolean;
}>()

const mainState: MainState = inject("state") as MainState

const fetchFeeds = async (direction: "new" | "old") => {
  await mainState.fetchFeeds(props.type, direction)
}
</script>

<template>
  <div class="feed-list">
    <button
      v-if="hasFetchButton"
      class="fetch-feeds-button"
      @click.prevent="fetchFeeds('new')"
    >
      <SVGIcon name="hand"/>
    </button>
    <div class="feeds">
      <div
        v-for="feed of props.feeds"
        class="feed"
      >
        <Post
          v-if="feed.reply?.root && feed.post.cid !== feed.reply?.root?.cid"
          type="root"
          :post="feed.reply.root"
        />
        <Post
          v-if="feed.reply?.parent && feed.post.cid !== feed.reply?.parent?.cid && feed.reply?.root?.cid !== feed.reply?.parent?.cid"
          type="parent"
          :post="feed.reply.parent"
        />
        <Post
          type="post"
          :post="feed.post"
        />
      </div>
    </div>
    <button
      v-if="hasFetchButton"
      class="fetch-feeds-button"
      @click.prevent="fetchFeeds('old')"
    >
      <SVGIcon name="hand"/>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.feed-list {
  display: flex;
  flex-direction: column;
}

.fetch-feeds-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  &:first-child {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  }
  &:last-child {
    border-top: 1px solid rgba(var(--fg-color), 0.25);
  }

  & > .svg-icon {
    fill: rgb(var(--fg-color));
  }

  &:focus, &:hover {
    background-color: rgba(var(--accent-color), 0.125);

    & > .svg-icon {
      fill: rgb(var(--accent-color));
    }
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
  &:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
  }
}
</style>
