<script lang="ts" setup>
import { inject } from "vue"
import AuthorHandle from "@/components/app-parts/AuthorHandle.vue"
import Post from "@/components/app-parts/Post.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string, params?: any): void}>()

defineProps<{
  feed: TTFeed
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
    <!-- オープナー -->
    <div
      v-if="feed.__folding"
      class="folder"
      @click="feed.__folding = !feed.__folding"
    >
      <!-- 折り畳みリプライオープナー -->
      <div
        v-if="feed.reply != null"
        class="folder__item"
        :data-is-following="feed.post.author.viewer?.following != null"
      >
        <SVGIcon name="reply" />
        <div class="display-name">{{
          !mainState.currentSetting.postAnonymization
            ? feed.post.author.displayName
            : $t("anonymous")
        }}</div>
        <AuthorHandle :handle="feed.post.author.handle" />
      </div>

      <!-- 折り畳みリポストオープナー -->
      <div
        v-if="feed.reason != null"
        class="folder__item"
        :data-is-following="feed.reason.by.viewer?.following != null"
      >
        <SVGIcon name="repost" />
        <div class="display-name">{{
          !mainState.currentSetting.postAnonymization
            ? feed.reason.by.displayName
            : $t("anonymous")
        }}</div>
        <AuthorHandle :handle="feed.reason.by.handle" />
      </div>
    </div>

    <!-- 本体 -->
    <template v-else>
      <template v-if="feed.__replyDisplay && (feed.reply?.root != null || feed.reply?.parent != null)">
        <!-- ルートポスト -->
        <Post
          v-if="feed.reply?.root != null && feed.reply.root.cid !== feed.reply.parent?.cid"
          position="root"
          :post="feed.reply.root"
          :isInFeed="true"
          :data-has-child="feed.reply.root.cid === feed.reply?.parent?.record.reply?.parent?.cid"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />

        <!-- リプライポスト -->
        <Post
          v-if="feed.reply?.parent != null"
          position="parent"
          :post="feed.reply.parent"
          :rootPost="feed.reply?.root"
          :isInFeed="true"
          :data-has-child="feed.reply.parent.cid === feed.post?.record?.reply?.parent?.cid"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />
      </template>

      <!-- ポスト -->
      <Post
        v-if="feed.post != null"
        position="post"
        :post="feed.post"
        :rootPost="feed.reply?.root"
        :parentPost="feed.reply?.parent"
        :isInFeed="true"
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
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.5em;
  align-items: center;
  padding: 0.75em 1em;
  &:focus, &:hover {
    .folder__item {
      --alpha: 0.75;

      & > .author-handle {
        --fg-color-05: unset;
      }
    }
  }

  &__item {
    --alpha: 0.5;
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    overflow: hidden;

    & > .svg-icon {
      fill: rgb(var(--fg-color), var(--alpha));
      font-size: 0.875em;
    }

    & > .display-name {
      color: rgb(var(--fg-color), var(--alpha));
      font-size: 0.875em;
      font-weight: bold;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    & > .author-handle {
      --fg-color-05: var(--fg-color-025);
      font-size: 0.75em;
    }
  }
}
</style>