<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import Thumbnail from "@/components/Thumbnail.vue"
import Loader from "@/components/Loader.vue"
import MenuTicker from "@/components/MenuTicker.vue"
import Post from "@/components/Post.vue"
import PostAndProfileMenuTicker from "@/components/PostAndProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  position: "post" | "root" | "parent" | "postInPost" | "preview";
  post: TTPost;
  replyTo?: TTPost;
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  postMenuDisplay: boolean;
  repostMenuDisplay: boolean;
  processing: boolean;
  external: ComputedRef<undefined | TTExternal>;
  images: ComputedRef<Array<TTImage>>;
}>({
  postMenuDisplay: false,
  repostMenuDisplay: false,
  processing: false,
  external: computed(() => props.post.embed?.external),
  images: computed(() => {
    return props.post.embed?.images ?? []
  })
})

const router = useRouter()

function isFocused (): boolean {
  return props.post.uri === mainState.currentQuery.postUri
}

async function onActivatePost (post: TTPost) {
  if (isFocused()) return
  await router.push({ name: "post", query: { postUri: post.uri } })
}

function onActivateReplierLink () {
  emit("onClickReplier")
}

async function onActivateProfileLink (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}

async function onActivateReplyButton () {
  Util.blurElement()
  const done = await mainState.openSendPostPopup("reply", props.post)
  state.processing = true
  try {
    if (done) {
      if (mainState.currentPath.startsWith("/post")) await mainState.fetchPostThread()
      else await updateThisPostThread()
    }
  } finally {
    state.processing = false
  }
}

async function onActivateRepostMenuTrigger () {
  state.repostMenuDisplay = !state.repostMenuDisplay
}

async function onActivateSendRepostButton () {
  Util.blurElement()
  state.repostMenuDisplay = false
  state.processing = true
  try {
    const result = await mainState.atp.createRepost(
      props.post.uri,
      props.post.cid
    )
    if (result) await updateThisPostThread()
  } finally {
    state.processing = false
  }
}

async function onActivateDeleteRepostButton () {
  Util.blurElement()
  if (props.post.viewer.repost == null) return
  state.repostMenuDisplay = false
  state.processing = true
  try {
    await mainState.atp.deleteRepost(props.post.viewer.repost)
    await updateThisPostThread()
  } finally {
    state.processing = false
  }
}

async function onActivateQuoteRepostButton () {
  Util.blurElement()
  state.repostMenuDisplay = false
  const done = await mainState.openSendPostPopup("quoteRepost", props.post)
  state.processing = true
  try {
    if (done) await updateThisPostThread()
  } finally {
    state.processing = false
  }
}

async function onActivateLikeButton () {
  if (state.processing) return
  Util.blurElement()
  state.processing = true
  try {
    const liked = props.post.viewer.like != null
    if (liked) await mainState.atp.deleteLike(props.post.viewer.like as string)
    else await mainState.atp.createLike(props.post.uri, props.post.cid)
    await updateThisPostThread()
  } finally {
    state.processing = false
  }
}

function onActivatePostMenuTrigger () {
  Util.blurElement()
  state.postMenuDisplay = !state.postMenuDisplay
}

function onClosePostMenu () {
  state.postMenuDisplay = false
}

function onActivateOpenRepostUsersPopup () {
  Util.blurElement()
  mainState.openRepostUsersPopup(props.post.uri)
  onClosePostMenu()
}

function onActivateOpenLikeUsersPopup () {
  Util.blurElement()
  mainState.openLikeUsersPopup(props.post.uri)
  onClosePostMenu()
}

function onRemoveThisPost (uri: string) {
  emit("removeThisPost", uri)
}

async function updateThisPostThread () {
  const posts: null | Array<TTPost> =
    await mainState.atp.fetchPostThread(props.post.uri, 1)
  if (posts == null || posts.length === 0) return
  emit("updateThisPostThread", posts)
}
</script>

<template>
  <div
    class="post"
    :data-position="position"
    :data-repost="post.__reason != null"
    :data-focus="isFocused()"
    @click.prevent.stop="onActivatePost(post)"
  >
    <div class="header">
      <!-- リプライ先ユーザー -->
      <div
        v-if="replyTo != null"
        class="replier"
        @click.stop="onActivateReplierLink"
      >
        <SVGIcon name="post" />
        <div class="replier__display-name">{{ replyTo?.author?.displayName }}</div>
        <div class="replier__handle">{{ replyTo?.author?.handle }}</div>
      </div>

      <!-- リポストユーザー -->
      <div
        v-if="post.__reason != null"
        class="reposter"
        @click.stop="onActivateProfileLink(post.__reason?.by?.handle as string)"
      >
        <SVGIcon name="repost" />
        <div class="reposter__display-name">{{ post.__reason?.by?.displayName }}</div>
        <div class="reposter__handle">{{ post.__reason?.by?.handle }}</div>
      </div>
    </div>
    <div class="body">
      <!-- アバター -->
      <button
        class="avatar"
        @click.stop="onActivateProfileLink(post.author?.handle)"
      >
        <img
          loading="lazy"
          :src="post.author?.avatar ?? '/img/void-avatar.png'"
        >
      </button>
      <div class="body__right">
        <div class="body__header">
          <!-- 表示名 -->
          <div class="display-name">{{ post.author?.displayName }}</div>

          <!-- ハンドル -->
          <div class="handle">{{ post.author?.handle }}</div>

          <!-- ポスト時間 -->
          <div
            v-if="post.indexedAt"
            class="indexed-at"
          >{{ Util.dateLabel(post.indexedAt, mainState.currentSetting.language) }}</div>
        </div>

        <!-- 本文 -->
        <div
          class="text"
          dir="auto"
          v-html="post.record?.__textHtml ?? post.value?.__textHtml"
        />
      </div>
    </div>
    <div class="body__footer">
      <!-- リンクボックス -->
      <a
        v-if="state.external != null"
        class="external"
        :href="state.external.uri"
        rel="noreferrer"
        target="_blank"
        @click.stop
      >
        <img
          v-if="typeof state.external.thumb === 'string'"
          class="external__thumb"
          loading="lazy"
          :src="state.external.thumb"
        />
        <div class="external__meta">
          <div class="external__title">{{ state.external.title ?? '' }}</div>
          <div class="external__uri">{{ state.external.uri }}</div>
          <div class="external__description">{{ state.external.description ?? '' }}</div>
        </div>
      </a>

      <!-- 画像 -->
      <div
        v-if="state.images.length > 0"
        class="images"
        :data-number-of-images="state.images.length"
      >
        <div
          v-for="image, imageIndex of state.images"
          :key="imageIndex"
          class="image"
        >
          <!--
            TODO: 直前の投稿画像と同じ画像が表示される問題対策
                  key なしでも正常に表示されるようにすること
          -->
          <Thumbnail
            :key="post.cid"
            :image="image"
            :did="post.author.did"
          />
        </div>
      </div>

      <!-- 引用リポスト -->
      <div
        v-if="post.embed?.record && (post.embed.record as any).$type != null"
        class="repost"
      >
        <Post
          position="postInPost"
          :post="post.embed.record as TTPost"
        />
      </div>

      <div
        v-if="position !== 'postInPost'"
        class="button-container"
      >
        <div>
          <!-- リプライボタン -->
          <button
            class="icon-button reply_count"
            :data-has="post.replyCount > 0"
            @click.stop="onActivateReplyButton"
          >
            <SVGIcon name="post" />
            <span>{{ post.replyCount > 0 ? post.replyCount : "" }}</span>
          </button>
        </div>
        <div>
          <!-- リポストボタン -->
          <button
            class="icon-button repost-count"
            :data-has="post.repostCount > 0"
            :data-reposted="!!post.viewer.repost"
            @click.stop="onActivateRepostMenuTrigger"
          >
            <SVGIcon name="repost" />
            <span>{{ post.repostCount > 0 ? post.repostCount : "" }}</span>

            <!-- リポストメニュー -->
            <MenuTicker :display="state.repostMenuDisplay">
              <button
                v-if="post.viewer.repost == null"
                @click.stop="onActivateSendRepostButton"
              >
                <SVGIcon name="repost" />
                <span>{{ $t("sendRepost") }}</span>
              </button>
              <button
                v-else
                @click.stop="onActivateDeleteRepostButton"
              >
                <SVGIcon name="repost" />
                <span>{{ $t("deleteRepost") }}</span>
              </button>
              <button @click.stop="onActivateQuoteRepostButton">
                <SVGIcon name="quoteRepost" />
                <span>{{ $t("sendQuoteRepost") }}</span>
              </button>
            </MenuTicker>
          </button>
        </div>
        <div>
          <!-- いいねボタン -->
          <button
            class="icon-button like-count"
            :data-has="post.likeCount > 0"
            :data-liked="!!post.viewer.like"
            @click.stop="onActivateLikeButton"
          >
            <SVGIcon name="heart" />
            <span>{{ post.likeCount > 0 ? post.likeCount : "" }}</span>
          </button>
        </div>
        <div>
          <!-- ポストメニューボタン -->
          <button
            class="icon-button menu-button"
            @click.stop="onActivatePostMenuTrigger"
          >
            <SVGIcon name="menu" />

            <!-- ポストメニュー -->
            <PostAndProfileMenuTicker
              :display="state.postMenuDisplay"
              :translateText="post.record?.text"
              :copyText="post.record?.text"
              :mentionTo="post.author?.handle"
              :deletePostUri="post.author?.did === mainState.atp.session?.did
                ? post.uri
                : undefined"
              :openSource="post"
              @close="onClosePostMenu"
              @removeThisPost="onRemoveThisPost"
            >
              <template v-slot:before>
                <!-- リポストユーザーリストポップアップボタン -->
                <button @click.stop="onActivateOpenRepostUsersPopup">
                  <SVGIcon name="repost" />
                  <span>{{ $t("repostUsers") }}</span>
                </button>

                <!-- ライクユーザーリストポップアップボタン -->
                <button @click.stop="onActivateOpenLikeUsersPopup">
                  <SVGIcon name="heart" />
                  <span>{{ $t("likeUsers") }}</span>
                </button>

                <hr>
              </template>
            </PostAndProfileMenuTicker>
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
  flex-direction: column;
  padding: 1em;
  position: relative;
  &[data-focus="true"]:not([data-position="preview"]) {
    background-color: rgba(var(--accent-color), 0.125);

      & > .body > .body__right {
      user-select: text;
    }
  }
  &[data-position="postInPost"] {
    font-size: 0.875em;
  }
  &[data-position="preview"] {
    font-size: 0.875em;
    padding: 0;
    pointer-events: none;

    .external,
    .images,
    .button-container {
      display: none;
    }
  }
}

.header:not(:empty) {
  display: flex;
  grid-gap: 1em;
  margin-bottom: 0.5em;
}

.replier,
.reposter {
  cursor: pointer;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  grid-gap: 0.5em;
  margin: -1em -1em -0.5em;
  padding: 1em 1em 0.5em;

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
    font-weight: bold;
  }
  &__handle {
    font-size: 0.75em;
  }
}
.replier {
  &:focus, &:hover {
    & > .svg-icon {
      fill: rgb(var(--post-color));
    }

    .replier__display-name {
      color: rgb(var(--post-color));
    }
    .replier__handle {
      color: rgba(var(--post-color), 0.75);
    }
  }

  & > .svg-icon {
    fill: rgba(var(--post-color), 0.75);
    transform: scaleX(-1.0);
  }

  &__display-name {
    color: rgba(var(--post-color), 0.75);
  }
  &__handle {
    color: rgba(var(--post-color), 0.5);
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
  position: relative;
}

.avatar {
  position: relative;
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
  color: rgba(var(--fg-color), 0.75);
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

.indexed-at {
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

  // 折り返されたURLの隙間が選択されないようにする
  &:deep(.textlink) {
    padding: 0.125em 0;
  }
}

.body__footer {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  &:not(:empty) {
    margin-top: 0.75em;
  }
}
.post[data-position="post"],
.post[data-position="root"],
.post[data-position="parent"] {
  & > .body__footer {
    padding-left: calc(var(--avatar-size) + 1em);
  }
}

.external {
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  cursor: pointer;
  &:focus, &:hover {
    border-color: rgba(var(--fg-color), 0.5);
  }

  &__thumb {
    aspect-ratio: 1.91 / 1;
    border-radius: var(--border-radius);
    display: block;
    object-fit: cover;
  }
  &__meta{
    display: grid;
    grid-template-rows: auto auto auto;
    padding: 1em;
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
  aspect-ratio: 16 / 9;
  display: grid;
  grid-gap: 2px;
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
  border-radius: var(--border-radius);
  overflow: hidden;

  .thumbnail {
    cursor: pointer;
    height: 100%;
    &:deep() > img {
      aspect-ratio: 16 / 9;
      display: block;
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
}

.repost {
  grid-area: r;
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);

  & > .post {
    padding: 0.875em;
  }
}

.button-container {
  grid-area: f;
  display: grid;
  align-items: center;
  &:not(:first-child) {
    margin-top: 0.5em;
  }

  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    grid-template-columns: 1fr 1fr 1fr 2fr;
  }
  @media not all and (min-width: calc($router-view-width + $main-menu-min-width)) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
}

.repost-count {
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
      &[data-to-down="true"] {
        top: 2.5em;
      }
      &[data-to-down="false"] {
        bottom: 2.5em;
      }
    }
  }
}

.like-count[data-liked="true"] {
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
      right: 0;
      &[data-to-down="true"] {
        top: 2.5em;
      }
      &[data-to-down="false"] {
        bottom: 2.5em;
      }
    }
  }
}
</style>
