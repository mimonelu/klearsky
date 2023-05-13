<script lang="ts" setup>
import { inject } from "vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  feed: TTFeed;
}>()

const mainState = inject("state") as MainState

function updateThisPostThread (newPosts: Array<TTPost>) {
  emit("updateThisPostThread", newPosts)
}

function removeThisPost (uri: string) {
  emit("removeThisPost", uri)
}
</script>

<template>
  <div class="feed">
    <div
      v-if="feed.__folding"
      class="folder"
      :data-has-reply-and-repost="feed.reply != null && feed.reason != null"
      @click="feed.__folding = !feed.__folding"
    >
      <div
        v-if="feed.reply != null"
        class="folder__item"
      >
        <SVGIcon name="post" />
        <div class="display-name">{{
          !mainState.currentSetting.postAnonymization
            ? feed.post.author.displayName
            : $t("anonymous")
        }}</div>
        <div class="handle">{{
          !mainState.currentSetting.postAnonymization
            ? feed.post.author.handle
            : ""
        }}</div>
      </div>
      <div
        v-if="feed.reason != null"
        class="folder__item"
      >
        <SVGIcon name="repost" />
        <div class="display-name">{{
          !mainState.currentSetting.postAnonymization
            ? feed.reason.by.displayName
            : $t("anonymous")
        }}</div>
        <div class="handle">{{
          !mainState.currentSetting.postAnonymization
            ? feed.reason.by.handle
            : ""
        }}</div>
      </div>
    </div>
    <template v-else>
      <template v-if="feed.__replyDisplay && (feed.reply?.root != null || feed.reply?.parent != null)">
        <Post
          v-if="feed.reply?.root != null && feed.reply.root.cid !== feed.reply.parent?.cid"
          position="root"
          :post="feed.reply.root"
          :data-has-child="feed.reply.root.cid === feed.reply?.parent?.record.reply?.parent?.cid"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />
        <Post
          v-if="feed.reply?.parent != null"
          position="parent"
          :post="feed.reply.parent"
          :data-has-child="feed.reply.parent.cid === feed.post?.record?.reply?.parent?.cid"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />
      </template>
      <Post
        v-if="feed.post != null"
        position="post"
        :post="feed.post"
        :replyTo="feed.reply?.parent"
        @onClickReplier="feed.__replyDisplay = !feed.__replyDisplay"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.folder {
  cursor: pointer;
  display: grid;
  grid-gap: 0.5em;
  align-items: center;
  padding: 0.5em 1em;
  &[data-has-reply-and-repost="false"] {
    grid-template-columns: 1fr;
  }
  &[data-has-reply-and-repost="true"] {
    grid-template-columns: 1fr 1fr;
  }

  &__item {
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    overflow: hidden;

    & > .svg-icon {
      fill: rgba(var(--fg-color), 0.25);
      font-size: 0.875em;
    }

    & > .svg-icon--post {
      transform: scaleX(-1);
    }

    & > .display-name {
      color: rgba(var(--fg-color), 0.5);
      font-size: 0.875em;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & > .handle {
      color: rgba(var(--fg-color), 0.25);
      font-size: 0.75em;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
