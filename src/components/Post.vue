<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import format from "date-fns/format"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import displayJson from "@/composables/display-json"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string, feed: Feed): void}>()

const props = defineProps<{
  type: "post" | "root" | "parent" | "postInPost";
  mode?: "preview";
  post: Post;
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean;
}>({
  processing: false,
})

const router = useRouter()

function formatDate (date: string): string {
  return format(new Date(date), "MM/dd HH:mm:ss")
}

async function openPost (uri: string) {
  await router.push({ name: "post", query: { uri } })
}

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}

async function reply () {
  mainState.openSendPostPopup("reply", props.post)
}

async function repost () {
  if (props.post.viewer.repost == null) {
    mainState.openSendPostPopup("repost", props.post)
    // TODO: 通常リポストが成功した場合、 updatePost を呼び出すこと
  } else {
    state.processing = true
    try {
      await mainState.atp.deleteRepost(props.post.viewer.repost)
      await updatePost()
    } finally {
      state.processing = false
    }
  }
}

async function upvote () {
  if (state.processing) return
  state.processing = true
  try {
    blurElement()
    const voted = props.post.viewer.upvote != null
    await mainState.atp.updateVote(props.post.uri, props.post.cid, voted ? "none" : "up")
    await updatePost()
  } finally {
    state.processing = false
  }
}

async function updatePost () {
  const posts: null | Array<Feed> = await mainState.atp.fetchPostThread(props.post.uri, 1)
  if (posts == null || posts.length === 0) return
  emit("update", posts[0])
}

function openSource () {
  blurElement()
  displayJson(props.post)
}
</script>

<template>
  <div
    class="post"
    :data-type="type"
    :data-mode="mode"
    :data-repost="post.__reason != null"
    @click.prevent.stop="openPost(post.uri)"
  >
    <div
      v-if="post.__reason != null"
      class="reposter"
    >
      <SVGIcon name="repost" />
      <a
        class="textlink reposter__display-name"
        @click.stop="openProfile(post.__reason?.by?.handle as string)"
      >{{ post.__reason?.by?.displayName }}</a>
      <div class="reposter__handle">{{ post.__reason?.by?.handle }}</div>
    </div>
    <div class="body">
      <button
        class="avatar"
        @click.stop="openProfile(post.author.handle)"
      >
        <img
          loading="lazy"
          :src="post.author.avatar ?? '/img/void.png'"
        >
      </button>
      <div class="right">
        <div class="header">
          <a
            class="textlink display-name"
            tabindex="0"
            @click.stop="openProfile(post.author.handle)"
          >{{ post.author.displayName }}</a>
          <div class="handle">{{ post.author.handle }}</div>
          <div
            v-if="post.indexedAt"
            class="indexed_at"
          >{{ formatDate(post.indexedAt) }}</div>
        </div>
        <div
          class="text"
          v-html="post.record.__textHtml"
        />
        <div
          v-if="post.embed?.record"
          class="repost"
        >
          <Post
            type="postInPost"
            :post="post.embed.record as Post"
          />
        </div>
        <div
          v-if="post.embed?.images"
          class="images"
        >
          <a
            v-for="image of post.embed.images"
            class="image"
            :href="image.fullsize"
            rel="noreferrer"
            target="_blank"
            tabindex="0"
            :title="image.alt"
            :style="`background-image: url(${image.thumb});`"
            @click.stop
          />
        </div>
        <div
          v-if="type !== 'postInPost'"
          class="footer"
        >
          <div>
            <button
              class="icon-button reply_count"
              :data-has="post.replyCount > 0"
              @click.stop="reply"
            >
              <SVGIcon name="post" />
              <span>{{ post.replyCount > 0 ? post.replyCount : "" }}</span>
            </button>
          </div>
          <div>
            <button
              class="icon-button repost_count"
              :data-has="post.repostCount > 0"
              :data-reposted="!!post.viewer.repost"
              @click.stop="repost"
            >
              <SVGIcon name="repost" />
              <span>{{ post.repostCount > 0 ? post.repostCount : "" }}</span>
            </button>
          </div>
          <div>
            <button
              class="icon-button upvote_count"
              :data-has="post.upvoteCount > 0"
              :data-voted="!!post.viewer.upvote"
              @click.stop="upvote"
            >
              <SVGIcon name="heart" />
              <span>{{ post.upvoteCount > 0 ? post.upvoteCount : "" }}</span>
            </button>
          </div>
          <div>
            <button
              class="icon-button source"
              @click.stop="openSource"
            >
              <SVGIcon name="json" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <Loader
      v-if="state.processing"
      @click.stop
    />
  </div>
</template>

<style lang="scss" scoped>
.post {
  --avatar-size: 3em;

  display: flex;
  flex-direction: column;
  padding: 1em;
  position: relative;

  &[data-type="root"],
  &[data-type="parent"] {
    &::before {
      background-color: rgba(var(--fg-color), 0.25);
      content: "";
      display: block;
      position: absolute;
      top: calc(1em + var(--avatar-size) + 8px);
      left: calc(2.5em - 1px);
      width: 2px;
      height: calc(100% - var(--avatar-size) - 16px);
    }
  }

  &[data-type="postInPost"] {
    font-size: 0.875rem;
  }

  &[data-mode="preview"] {
    font-size: 0.875rem;
    pointer-events: none;

    .images,
    .footer {
      display: none;
    }
  }
}

.reposter {
  display: grid;
  grid-template-columns: max-content auto 1fr;
  align-items: center;
  grid-gap: 0.5em;
  margin-bottom: 1em;

  & > .svg-icon {
    fill: rgb(var(--green));
    font-size: 0.875em;
  }

  &__display-name {
    color: rgb(var(--green));
    cursor: pointer;
    font-size: 0.875em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__handle {
    color: rgba(var(--green), 0.5);
    font-size: 0.75em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.body {
  display: flex;
  grid-gap: 1em;
}

.avatar {
  @include avatar-link(var(--avatar-size));
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

.display-name {
  color: rgb(var(--fg-color));
  cursor: pointer;
  font-size: 0.875em;
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

  & > .post {
    padding: 0.875em;
  }
}

.images {
  grid-area: i;
  aspect-ratio: 1.91 / 1;
  display: grid;
  grid-gap: 3px;
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
  outline: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: 1px;
  display: block;
  &:focus, &:hover {
    outline-color: rgba(var(--fg-color), 0.5);
  }
}

.footer {
  grid-area: f;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  align-items: center;
  margin-top: 0.5em;
}

.repost_count[data-reposted="true"] {
  & > .svg-icon {
    fill: rgb(var(--green));
  }

  & > span {
    color: rgb(var(--green));
  }
}

.upvote_count[data-voted="true"] {
  & > .svg-icon {
    fill: rgb(var(--pink));
  }

  & > span {
    color: rgb(var(--pink));
  }
}

.source {
  margin-left: auto;
}
</style>
