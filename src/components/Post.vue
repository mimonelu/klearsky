<script lang="ts" setup>
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { formatDate } from "@/composables/misc"

const props = defineProps<{
  type: "post" | "root" | "parent" | "repost";
  post: any;
}>()
</script>

<template>
  <div
    class="post"
    :data-type="type"
  >
    <a
      class="avatar"
      :style="`background-image: url(${props.post.author.avatar});`"
    />
    <div class="right">
      <div class="header">
        <div class="display_name">{{ props.post.author.displayName }}</div>
        <div class="handle">{{ props.post.author.handle }}</div>
        <div
          v-if="props.post.indexedAt"
          class="indexed_at"
        >{{ formatDate(props.post.indexedAt, "") }}</div>
      </div>
      <div class="text">{{ props.post.record.text }}</div>
      <div
        v-if="props.post.embed?.record"
        class="repost"
      >
        <Post
          type="repost"
          :post="props.post.embed.record"
        />
      </div>
      <div
        v-if="props.post.embed?.images"
        class="images"
      >
        <a
          v-for="image of props.post.embed.images"
          class="image"
          :href="image.fullsize"
          rel="noreferrer"
          target="_blank"
          :title="image.alt"
          :style="`background-image: url(${image.thumb});`"
        />
      </div>
      <div
        v-if="type !== 'repost'"
        class="footer"
      >
        <div
          class="reply_count"
          :data-has="props.post.replyCount > 0"
        >
          <SVGIcon name="post" />
          <span>{{ props.post.replyCount > 0 ? props.post.replyCount : "" }}</span>
        </div>
        <div
          class="repost_count"
          :data-has="props.post.repostCount > 0"
        >
          <SVGIcon name="repost" />
          <span>{{ props.post.repostCount > 0 ? props.post.repostCount : "" }}</span>
        </div>
        <div
          class="upvote_count"
          :data-has="props.post.upvoteCount > 0"
        >
          <SVGIcon name="thumbUp" />
          <span>{{ props.post.upvoteCount > 0 ? props.post.upvoteCount : "" }}</span>
        </div>
        <div
          class="downvote_count"
          :data-has="props.post.downvoteCount > 0"
        >
          <SVGIcon name="thumbDown" />
          <span>{{ props.post.downvoteCount > 0 ? props.post.downvoteCount : "" }}</span>
        </div>
      </div>
      <pre
        v-if="false"
        class="source"
      >{{ JSON.stringify(props.post, null, 2) }}</pre>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../scss/variables.scss";

.post {
  --avatar-size: 3em;

  display: flex;
  grid-gap: 1em;
  position: relative;

  &[data-type="root"],
  &[data-type="parent"] {
    &::before {
      background-color: rgba(var(--fg-color), 0.5);
      content: "";
      display: block;
      position: absolute;
      top: calc(var(--avatar-size) + 2px);
      left: calc(1.5em - 1px);
      width: 2px;
      height: calc(100% - var(--avatar-size) + 1em - 4px);
    }
  }

  &[data-type="repost"] {
    font-size: 0.875rem;
  }
}

.avatar {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 1px;
  display: block;
  min-width: var(--avatar-size);
  height: var(--avatar-size);
}

.right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 0.5em;
}

.header {
  grid-area: h;
  display: grid;
  align-items: baseline;
  grid-template-columns: max-content auto min-content;
  grid-gap: 0.5em;
  overflow: hidden;
}

.text {
  line-height: 1.375;
  white-space: pre-wrap;
  word-break: break-all;
  &:empty {
    display: contents;
  }
}

.repost {
  grid-area: r;
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: 1px;
  padding: 0.875em;
}

.images {
  grid-area: i;
  aspect-ratio: 1.91 / 1;
  display: grid;
  grid-gap: 1px;
  &:has(:nth-child(2)) {
    grid-template-areas: "a b";
    & > .image:nth-child(1) { grid-area: a; }
    & > .image:nth-child(2) { grid-area: b; }
  }
  &:has(:nth-child(3)) {
    grid-template-areas: "a b" "a c";
    & > .image:nth-child(1) { grid-area: a; }
    & > .image:nth-child(2) { grid-area: b; }
    & > .image:nth-child(3) { grid-area: c; }
  }
  &:has(:nth-child(4)) {
    grid-template-areas: "a b" "c d";
    & > .image:nth-child(1) { grid-area: a; }
    & > .image:nth-child(2) { grid-area: b; }
    & > .image:nth-child(3) { grid-area: c; }
    & > .image:nth-child(4) { grid-area: d; }
  }
}

.image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: 1px;
  display: block;
}

.footer {
  grid-area: f;
  display: flex;
  align-items: center;
  grid-gap: 1em;
  margin-top: 0.5em;
  overflow: hidden;
}

.source {
  background-color: rgba(var(--fg-color), 0.125);
  font-size: 0.875em;
  line-height: 1.375;
  margin-top: 0.5em;
  padding: 1em;
  overflow: scroll;
  max-height: 8rem;
  word-break: break-all;
  white-space: pre-wrap;
  @include scroll-bar();
}

.display_name {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.handle {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.75em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.indexed_at {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.75em;
  white-space: nowrap;
}

.reply_count,
.repost_count,
.upvote_count,
.downvote_count {
  display: flex;
  align-items: center;
  grid-gap: 0.5em;
  font-size: 0.875em;

  &[data-has="true"] > .svg-icon {
    fill: rgb(var(--fg-color));
  }
  &[data-has="false"] > .svg-icon {
    fill: rgba(var(--fg-color), 0.25);
  }
}

.reply_count {
  width: 4em;
}

.repost_count {
  width: 4em;
}

.upvote_count {
  width: 4em;
}

.downvote_count {
  width: 4em;
}
</style>
