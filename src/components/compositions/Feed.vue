<script lang="ts" setup>
import AuthorHandle from "@/components/labels/AuthorHandle.vue"
import DisplayName from "@/components/labels/DisplayName.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  feed: TTFeed
}>()

function toggleReplyDisplay () {
  props.feed.__replyDisplay = !props.feed.__replyDisplay
}

function updateThisPostThread (newPosts: Array<TTPost>) {
  emit("updateThisPostThread", newPosts)
}

function removeThisPost (uri: string) {
  emit("removeThisPost", uri)
}
</script>

<template>
  <div class="feed">
    <!-- 新規取得ライン -->
    <div
      v-if="feed.__fetchingLine === true"
      class="feed__fetching-line"
    >
      <SVGIcon name="shimmer" />
    </div>

    <!-- オープナー -->
    <div
      v-if="feed.__folding"
      class="folder"
      @click="feed.__folding = !feed.__folding"
    >
      <SVGIcon name="cursorUp" />

      <!-- 折り畳みリプライオープナー -->
      <div
        v-if="feed.reply != null"
        class="folder__item"
      >
        <SVGIcon name="reply" />
        <DisplayName
          :displayName="feed.post.author.displayName"
          :anonymizable="true"
        />
        <AuthorHandle
          :handle="feed.post.author.handle"
          :anonymizable="true"
        />
      </div>

      <!-- 折り畳みリポストオープナー -->
      <div
        v-if="feed.reason != null"
        class="folder__item"
      >
        <SVGIcon name="repost" />
        <DisplayName
          :displayName="feed.reason.by.displayName"
          :anonymizable="true"
        />
        <AuthorHandle
          :handle="feed.reason.by.handle"
          :anonymizable="true"
        />
      </div>
    </div>

    <!-- 本体 -->
    <template v-else>
      <template v-if="feed.__replyDisplay && (feed.reply?.root != null || feed.reply?.parent != null)">
        <!-- ルートポスト -->
        <Post
          v-if="feed.reply?.root != null && !feed.reply?.root.notFound && feed.reply.root.uri !== feed.reply.parent?.uri"
          position="root"
          :post="feed.reply.root"
          :isInFeed="true"
          :data-has-child="feed.reply.root.uri === feed.reply?.parent?.record.reply?.parent?.uri"
          @updateThisPostThread="updateThisPostThread"
          @removeThisPost="removeThisPost"
        />

        <!-- 親ポスト -->
        <Post
          v-if="feed.reply?.parent != null && !feed.reply?.parent.notFound"
          position="parent"
          :post="feed.reply.parent"
          :rootPost="feed.reply?.root"
          :grandparentAuthor="
            // root と grandparentAuthor が同一アカウントの場合は grandparentAuthor を表示しない
            feed.reply?.grandparentAuthor?.did !== feed.reply?.root?.author?.did
              ? feed.reply?.grandparentAuthor
              : undefined
          "
          :isInFeed="true"
          :data-has-child="feed.reply.parent.uri === feed.post?.record?.reply?.parent?.uri"
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
        @onClickReplier="toggleReplyDisplay"
        @updateThisPostThread="updateThisPostThread"
        @removeThisPost="removeThisPost"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.feed {
  // 新規取得ラインと抜け漏れ取得ボタンとの間に隙間を取る
  [data-direction="middle"] ~ & > &__fetching-line {
    margin-top: 1em;
  }

  // 新規取得ライン
  &__fetching-line {
    display: flex;
    justify-content: center;
    position: relative;

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
      font-size: 1.5em;
      position: relative;
    }

    &::before {
      content: "";
      background-image: linear-gradient(
        to right,
        rgb(var(--fg-color), 0.25) 45%,
        transparent 45%,
        transparent 55%,
        rgb(var(--fg-color), 0.25) 55%
      );
      display: block;
      position: absolute;
      top: 50%;
      width: 100%;
      height: 1px;
    }
  }
}

.folder {
  --alpha: 0.5;
  cursor: pointer;
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  grid-gap: 0.5em;
  align-items: center;
  padding: 0.75em;
  &:focus, &:hover {
    --alpha: 0.75;
  }

  & > .svg-icon {
    fill: rgb(var(--fg-color), var(--alpha));
    font-size: 0.875em;
  }

  &__item {
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
    }

    & > .author-handle {
      font-size: 0.75em;
    }
  }
}
</style>
