<script lang="ts" setup>
import { inject, reactive } from "vue"
import { useRouter } from "vue-router"
import format from "date-fns/format"
import Loader from "@/components/Loader.vue"
import MenuTicker from "@/components/MenuTicker.vue"
import Post from "@/components/Post.vue"
import PostAndProfileMenuTicker from "@/components/PostAndProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import { blurElement } from "@/composables/misc"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  type: "post" | "root" | "parent" | "postInPost";
  mode?: "preview";
  post: TTPost;
  replyTo?: TTPost;
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  postMenuDisplay: boolean;
  repostMenuDisplay: boolean;
  processing: boolean;
}>({
  postMenuDisplay: false,
  repostMenuDisplay: false,
  processing: false,
})

const router = useRouter()

function formatDate (date: string): string {
  return format(new Date(date), "MM/dd HH:mm")
}

function onClickReplier () {
  emit("onClickReplier")
}

async function openPost (uri: string) {
  await router.push({ name: "post", query: { uri } })
}

async function openProfile (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}

function openImagePopup (uri: string) {
  mainState.imagePopupProps.uri = uri
  mainState.imagePopupProps.display = true
}

async function reply () {
  blurElement()
  const done = await mainState.openSendPostPopup("reply", props.post)
  state.processing = true
  try {
    if (done) await mainState.fetchPostThread()
  } finally {
    state.processing = false
  }
}

async function repost () {
  blurElement()
  state.repostMenuDisplay = false
  state.processing = true
  try {
    const result = await mainState.atp.createPost({
      type: "quoteRepost",
      post: props.post,
      text: "",
      url: "",
      images: [],
      alts: [],
    })
    if (result) await updateThisPost()
  } finally {
    state.processing = false
  }
}

async function quoteRepost () {
  blurElement()
  state.repostMenuDisplay = false
  const done = await mainState.openSendPostPopup("quoteRepost", props.post)
  state.processing = true
  try {
    if (done) await updateThisPost()
  } finally {
    state.processing = false
  }
}

async function upvote () {
  if (state.processing) return
  blurElement()
  state.processing = true
  try {
    const voted = props.post.viewer.upvote != null
    await mainState.atp.updateVote(props.post.uri, props.post.cid, voted ? "none" : "up")
    await updateThisPost()
  } finally {
    state.processing = false
  }
}

async function updateThisPost () {
  const posts: null | Array<TTFeed> = await mainState.atp.fetchPostThread(props.post.uri, 1)
  if (posts == null || posts.length === 0) return
  emit("updateThisPost", posts[0])
}

async function openRepostMenu () {
  blurElement()

  // リポスト済みであればリポストメニューを開閉する
  if (props.post.viewer.repost == null) {
    state.repostMenuDisplay = !state.repostMenuDisplay
  } else {
    state.repostMenuDisplay = false
    state.processing = true
    try {
      await mainState.atp.deleteRepost(props.post.viewer.repost)
      await updateThisPost()
    } finally {
      state.processing = false
    }
  }
}

function openPostMenu () {
  blurElement()
  state.postMenuDisplay = !state.postMenuDisplay
}

function closePostMenu () {
  state.postMenuDisplay = false
}

function removeThisPost (uri: string) {
  emit("removeThisPost", uri)
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
    <div class="header">
      <div
        v-if="replyTo != null"
        class="replier"
        @click.stop="onClickReplier"
      >
        <SVGIcon name="post" />
        <div class="replier__display-name">{{ replyTo?.author.displayName }}</div>
        <div class="replier__handle">{{ replyTo?.author.handle }}</div>
      </div>
      <div
        v-if="post.__reason != null"
        class="reposter"
        @click.stop="openProfile(post.__reason?.by?.handle as string)"
      >
        <SVGIcon name="repost" />
        <div class="reposter__display-name">{{ post.__reason?.by?.displayName }}</div>
        <div class="reposter__handle">{{ post.__reason?.by?.handle }}</div>
      </div>
    </div>
    <div class="body">
      <button
        class="avatar"
        @click.stop="openProfile(post.author.handle)"
      >
        <img
          loading="lazy"
          :src="post.author.avatar ?? '/img/void-avatar.png'"
        >
      </button>
      <div class="body__right">
        <div class="body__header">
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
        <a
          v-if="post.embed?.external"
          class="external"
          :href="post.embed.external.uri"
          rel="noreferrer"
          target="_blank"
          @click.stop="blurElement"
        >
          <div class="external__title">{{ post.embed.external.title ?? '' }}</div>
          <div class="external__uri">{{ post.embed.external.uri }}</div>
          <div class="external__description">{{ post.embed.external.description ?? '' }}</div>
        </a>
        <div
          v-if="post.embed?.images"
          class="images"
          :data-number-of-images="post.embed?.images.length"
        >
          <div
            v-for="image of post.embed.images"
            class="image"
            @click.stop="openImagePopup(image.fullsize)"
          >
            <img
              loading="lazy"
              :src="image.thumb ?? '/img/void.png'"
              :alt="image.alt"
            />
          </div>
        </div>
        <div
          v-if="post.embed?.record"
          class="repost"
        >
          <Post
            type="postInPost"
            :post="post.embed.record as TTPost"
          />
        </div>
        <div
          v-if="type !== 'postInPost'"
          class="body__footer"
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
              @click.stop="openRepostMenu"
            >
              <SVGIcon name="repost" />
              <span>{{ post.repostCount > 0 ? post.repostCount : "" }}</span>
              <MenuTicker v-if="state.repostMenuDisplay">
                <button @click.stop="repost">
                  <SVGIcon name="repost" />
                  <span>{{ $t("sendRepost") }}</span>
                </button>
                <button @click.stop="quoteRepost">
                  <SVGIcon name="quoteRepost" />
                  <span>{{ $t("sendQuoteRepost") }}</span>
                </button>
              </MenuTicker>
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
              class="icon-button menu-button"
              @click.stop="openPostMenu"
            >
              <SVGIcon name="menu" />
              <PostAndProfileMenuTicker
                v-if="state.postMenuDisplay"
                :translateText="post.record.text"
                :copyText="post.record.text"
                :deletePostUri="post.author.did === mainState.atp.session?.did
                  ? post.uri
                  : undefined"
                :openSource="post"
                @close="closePostMenu"
                @removeThisPost="removeThisPost"
              />
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

  .feed-list &[data-type="root"]:not(:last-child),
  .feed-list &[data-type="parent"]:not(:last-child),
  .feed-thread &[data-type="root"],
  .feed-thread &[data-type="parent"] {
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
    font-size: 0.875em;
  }

  &[data-mode="preview"] {
    font-size: 0.875em;
    pointer-events: none;

    .images,
    .body__footer {
      display: none;
    }
  }
}

.header:not(:empty) {
  display: flex;
  grid-gap: 1em;
  margin-bottom: 1em;
}

.replier,
.reposter {
  cursor: pointer;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  grid-gap: 0.5em;
  margin: -1em;
  padding: 1em;

  & > .svg-icon {
    font-size: 0.875em;
  }

  &__display-name,
  &__handle {
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__display-name {
    font-size: 0.875em;
  }
  &__handle {
    font-size: 0.875em;
  }
}
.replier {
  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--accent-color));
    }

    .replier__display-name {
      color: rgb(var(--accent-color));
    }
    .replier__handle {
      color: rgba(var(--accent-color), 0.75);
    }
  }

  & > .svg-icon {
    fill: rgba(var(--accent-color), 0.75);
    transform: scaleX(-1.0);
  }

  &__display-name {
    color: rgba(var(--accent-color), 0.75);
  }
  &__handle {
    color: rgba(var(--accent-color), 0.5);
  }
}
.reposter {
  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--share-color));
    }

    .reposter__display-name {
      color: rgb(var(--share-color));
    }
    .reposter__handle {
      color: rgba(var(--share-color), 0.75);
    }
  }

  & > .svg-icon {
    fill: rgba(var(--share-color), 0.75);
  }

  &__display-name {
    color: rgba(var(--share-color), 0.75);
  }
  &__handle {
    color: rgba(var(--share-color), 0.5);
  }
}

.body {
  display: flex;
  grid-gap: 1em;
}

.avatar {
  @include avatar-link(var(--avatar-size));
}

.body__right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 0.5em;
}

.body__header {
  grid-area: h;
  display: grid;
  align-items: baseline;
  grid-template-columns: auto 1fr min-content;
  grid-gap: 0.5em;
  overflow: hidden;
}

.display-name {
  color: rgb(var(--fg-color));
  cursor: pointer;
  font-size: 0.875em;
  font-weight: bold;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.handle {
  color: rgba(var(--fg-color), 0.5);
  font-size: 0.75em;
  line-height: 1.25;
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
  word-break: break-word;
  &:empty {
    display: contents;
  }
}

.external {
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: 1px;
  cursor: pointer;
  display: grid;
  grid-template-rows: auto auto auto;
  padding: 1em;
  &:focus, &:hover {
    border-color: rgba(var(--fg-color), 0.5);
  }

  &__title,
  &__uri,
  &__description {
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  &__title {
    font-weight: bold;
  }
  &__uri {
    color: rgba(var(--fg-color), 0.5);
    font-size: 0.875em;
  }
  &__description {
    font-size: 0.875em;
  }
}

.images {
  grid-area: i;
  aspect-ratio: 1.91 / 1;
  display: grid;
  grid-gap: 1px;
  overflow: hidden;
  &[data-number-of-images="2"] {
    grid-template-areas: "a b";
    & > .image:nth-child(1) { grid-area: a; }
    & > .image:nth-child(2) { grid-area: b; }
  }
  &[data-number-of-images="3"] {
    grid-template-areas: "a b" "a c";
    & > .image:nth-child(1) { grid-area: a; }
    & > .image:nth-child(2) { grid-area: b; }
    & > .image:nth-child(3) { grid-area: c; }
  }
  &[data-number-of-images="4"] {
    grid-template-areas: "a b" "c d";
    & > .image:nth-child(1) { grid-area: a; }
    & > .image:nth-child(2) { grid-area: b; }
    & > .image:nth-child(3) { grid-area: c; }
    & > .image:nth-child(4) { grid-area: d; }
  }
}

.image {
  border: 1px solid transparent;
  border-radius: 1px;
  cursor: pointer;
  display: block;
  overflow: hidden;
  &:focus, &:hover {
    border-color: rgba(var(--fg-color), 0.25);
  }

  & > img {
    aspect-ratio: 1.91 / 1;
    display: block;
    object-fit: cover;
    width: 100%;
    height: 100%;
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

.body__footer {
  grid-area: f;
  display: grid;
  align-items: center;
  margin-top: 0.5em;

  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    grid-template-columns: 1fr 1fr 1fr 2fr;
  }
  @media not all and (min-width: calc($router-view-width + $main-menu-min-width)) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.repost_count {
  position: relative;
  &[data-reposted="true"] {
    & > .svg-icon {
      fill: rgb(var(--share-color));
    }

    & > span {
      color: rgb(var(--share-color));
    }
  }

  .menu-ticker:deep() {
    .menu-ticker--inner {
      left: 0;
      bottom: 2.5em;
    }
  }
}

.upvote_count[data-voted="true"] {
  & > .svg-icon {
    fill: rgb(var(--like-color));
  }

  & > span {
    color: rgb(var(--like-color));
  }
}

.menu-button {
  margin-left: auto;
  position: relative;

  .menu-ticker:deep() {
    .menu-ticker--inner {
      right: 2.5em;
    }
  }
}
</style>
