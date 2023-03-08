<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import type { Feed } from "@/composables/atp"
import type { MainState } from "@/@types/app.d"

const emit = defineEmits<{(event: string, value: any): void}>()

const props = defineProps<{
  type: "timline" | "post";
  feeds: Array<Feed>;
  cursor?: string;
  limit: number;
}>()

const state = reactive<{
  processing: boolean;
}>({
  processing: false,
})

const mainState: MainState = inject("state") as MainState

const fetchFeeds = async (direction: "old" | "new") => {
  if (state.processing) return
  state.processing = true
  try {
    const result: null | { feeds: Array<Feed>; cursor?: string } = await mainState.atp.fetchFeeds(
      props.limit,
      props.feeds,
      direction === "old" ? props.cursor : undefined
    )
    emit("updateFeeds", result)
  } finally {
    state.processing = false
  }
}

defineExpose({
  fetchFeeds,
})
</script>

<template>
  <div class="feed-list">
    <button
      class="fetch-feeds-button"
      @click.prevent="fetchFeeds('new')"
    >
      <SVGIcon name="hand"/>
      <Loader v-if="state.processing" />
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
      class="fetch-feeds-button"
      @click.prevent="fetchFeeds('old')"
    >
      <SVGIcon name="hand"/>
      <Loader v-if="state.processing" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.feed-list {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
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
  grid-gap: 1rem;
}

.feed {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(var(--fg-color), 0.25);
    padding-bottom: 1rem;
  }
}
</style>
