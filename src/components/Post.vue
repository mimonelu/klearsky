<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement, formatDate } from "@/composables/misc"

const router = useRouter()

const emit = defineEmits<{(event: string, post: any): void}>()

const props = defineProps<{
  type: "post" | "root" | "parent" | "repost" | "preview";
  post: any;
}>()

const mainState: MainState = inject("state") as MainState

const state = reactive<{
  processing: boolean;
}>({
  processing: false,
})

const openPost = async (uri: string) => {
  await router.push({ name: "post", query: { uri } })
}

const openProfile = async (did: string) => {
  await router.push({ name: "profile", query: { did } })
}

const reply = async () => {
  mainState.openSendPostPopup("reply", props.post)
}

const repost = async () => {
  const reposted = props.post.viewer.repost != null
  if (!reposted) {
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

const upvote = async () => {
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

const updatePost = async () => {
  const posts: null | Array<Feed> = await mainState.atp.fetchPostThread(props.post.uri, 1)
  if (posts == null || posts.length === 0) return
  emit("update", posts[0])
}

const openSource = () => {
  const windowObject = window.open()
  windowObject?.document.write(`<pre>${JSON.stringify(props.post, null, 2)}</pre>`)
}
</script>

<template>
  <div
    class="post"
    :data-type="type"
    @click.prevent.stop="openPost(props.post.uri)"
  >
    <button
      class="avatar"
      @click.stop="openProfile(props.post.author.did)"
    >
      <img
        loading="lazy"
        :src="props.post.author.avatar ?? '/img/void.png'"
      >
    </button>
    <div class="right">
      <div class="header">
        <a
          class="display_name"
          @click.stop="openProfile(props.post.author.did)"
        >{{ props.post.author.displayName }}</a>
        <a
          class="handle"
          @click.stop="openProfile(props.post.author.did)"
        >{{ props.post.author.handle }}</a>
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
          @click.stop
        />
      </div>
      <div
        v-if="type !== 'repost'"
        class="footer"
      >
        <div>
          <button
            class="footer-button reply_count"
            :data-has="props.post.replyCount > 0"
            @click.stop="reply"
          >
            <SVGIcon name="post" />
            <span>{{ props.post.replyCount > 0 ? props.post.replyCount : "" }}</span>
          </button>
        </div>
        <div>
          <button
            class="footer-button repost_count"
            :data-has="props.post.repostCount > 0"
            :data-reposted="!!props.post.viewer.repost"
            @click.stop="repost"
          >
            <SVGIcon name="repost" />
            <span>{{ props.post.repostCount > 0 ? props.post.repostCount : "" }}</span>
          </button>
        </div>
        <div>
          <button
            class="footer-button upvote_count"
            :data-has="props.post.upvoteCount > 0"
            :data-voted="!!props.post.viewer.upvote"
            @click.stop="upvote"
          >
            <SVGIcon name="heart" />
            <span>{{ props.post.upvoteCount > 0 ? props.post.upvoteCount : "" }}</span>
          </button>
        </div>
        <div>
          <button
            class="footer-button source"
            @click.stop="openSource"
          >
            <SVGIcon name="json" />
          </button>
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
  grid-gap: 1em;
  padding: 1em;
  position: relative;

  &[data-type="root"],
  &[data-type="parent"] {
    &::before {
      background-color: rgba(var(--fg-color), 0.25);
      content: "";
      display: block;
      position: absolute;
      top: calc(1em + var(--avatar-size) + 2px);
      left: calc(2.5em - 1px);
      width: 2px;
      height: calc(100% - var(--avatar-size) - 4px);
    }
  }

  &[data-type="repost"] {
    font-size: 0.875rem;
  }

  &[data-type="preview"] {
    font-size: 0.875rem;
    pointer-events: none;

    .images,
    .footer {
      display: none;
    }
  }
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

.display_name {
  cursor: pointer;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.handle {
  color: rgba(var(--fg-color), 0.5);
  cursor: pointer;
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
}

.footer-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  grid-gap: 0.5em;
  font-size: 0.875em;
  padding: 0.5em 1em;

  &[data-has="true"] > .svg-icon {
    fill: rgba(var(--fg-color), 0.75);
  }
  &[data-has="false"] > .svg-icon {
    fill: rgba(var(--fg-color), 0.25);
  }
  &:focus, &:hover {
    filter: brightness(1.5);
  }
}

.repost_count[data-reposted="true"] {
  color: rgb(var(--green));

  & > .svg-icon {
    fill: rgb(var(--green));
  }
}

.upvote_count[data-voted="true"] {
  color: rgb(var(--pink));

  & > .svg-icon {
    fill: rgb(var(--pink));
  }
}

.source {
  margin-left: auto;
  & > .svg-icon {
    fill: rgba(var(--fg-color), 0.25);
  }
}
</style>
