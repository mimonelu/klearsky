<script lang="ts" setup>
import { inject, onMounted, reactive, watch } from "vue"
import Post from "@/components/Post.vue"
import { waitProp } from "@/composables/misc"

const state = reactive<{
  feeds: Array<any>;
  cursor: null | string;
}>({
  feeds: [],
  cursor: null,
})

const mainState: MainState = inject("state") as MainState

onMounted(async () => {
  if (!mainState.hasLogin) await waitProp(() => mainState.hasLogin, true)
  const response: any = await mainState.atp.fetchFeeds(30)
  state.feeds.push(...response.feed)
  state.cursor = response.cursor
  console.log(state.feeds)
})
</script>

<template>
  <div class="feeds">
    <div
      v-for="feed of state.feeds"
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
</template>

<style lang="scss" scoped>
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
