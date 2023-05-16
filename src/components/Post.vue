<script lang="ts" setup>
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import { detect } from "@/../node_modules/tinyld/dist/tinyld.light.node.js" // TODO: 適切なパスで記述すること
import AvatarLink from "@/components/AvatarLink.vue"
import HtmlText from "@/components/HtmlText.vue"
import LinkBox from "@/components/LinkBox.vue"
import Loader from "@/components/Loader.vue"
import MenuTicker from "@/components/MenuTicker.vue"
import Post from "@/components/Post.vue"
import PostMenuTicker from "@/components/PostMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Thumbnail from "@/components/Thumbnail.vue"
import Util from "@/composables/util/index"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  level?: number;
  position: "post" | "root" | "parent" | "postInPost" | "preview" | "slim";
  post: TTPost;
  replyTo?: TTPost;
  forceHideImages?: boolean;
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  postMenuDisplay: boolean;
  repostMenuDisplay: boolean;
  processing: boolean;
  external: ComputedRef<undefined | TTExternal>;
  images: ComputedRef<Array<TTImage>>;
  displayImage: ComputedRef<boolean>;
  imageFolding: boolean;
  translation: "none" | "ignore" | "waiting" | "done" | "failed";
}>({
  postMenuDisplay: false,
  repostMenuDisplay: false,
  processing: false,
  external: computed(() => props.post.embed?.external),
  images: computed(() => props.post.embed?.images ?? []),

  // 画像の制御
  // TODO: 引用リポストに対応すること
  displayImage: computed(() => {
    // すべて表示
    if (mainState.currentSetting.imageControl === "all") return true

    // 自身とフォロイーとフォロイーのリポスト、およびプロフィールユーザーのみ表示
    if (mainState.currentSetting.imageControl === "followingEx" && (
      // 自身である
      props.post.author?.did === mainState.atp.session?.did ||
      // フォロイーである
      props.post.author.viewer.following != null ||
      // フォロイーのリポストである
      props.post.__reason?.by.viewer.following != null ||
      // プロフィールユーザーである
      (
        mainState.currentPath.startsWith('/profile/') &&
        props.post.author?.did === mainState.currentProfile?.did
      )
    )) return true

    // 自身とフォロイーのみ表示
    if (mainState.currentSetting.imageControl === "following" && (
      // 自身である
      props.post.author?.did === mainState.atp.session?.did ||
      // フォロイーである
      props.post.author.viewer.following != null
    )) return true

    // 自身のみ表示
    if (mainState.currentSetting.imageControl === "self" &&
      props.post.author?.did === mainState.atp.session?.did) return true

    return false
  }),

  // TODO: displayImage 共々 post に内包するべき
  imageFolding: false,

  translation: "none",
})

state.imageFolding = !state.displayImage

const router = useRouter()

const postElement = ref()

// 自動翻訳
const observer = mainState.currentSetting.autoTranslation
  ? new IntersectionObserver((items) => {
    items.forEach((item) => {
      if (!item.isIntersecting) return
      const cid = item.target.getAttribute("data-cid")
      if (cid !== props.post.cid || state.translation !== "none") return
      state.translation = "waiting"
      translateText() // No await
    })
  })
  : undefined

// 自動翻訳
onMounted(() => {
  observer?.observe(postElement.value)
})

// 自動翻訳
onBeforeUnmount(() => {
  observer?.unobserve(postElement.value)
})

function isFocused (): boolean {
  return props.post.uri === mainState.currentQuery.postUri
}

async function onActivatePost (post: TTPost, event: Event) {
  if (isFocused()) return
  const postUrl = { name: "post", query: { postUri: post.uri } }
  if ((event as any).metaKey || (event as any).ctrlKey) {
    const resolvedRoute = router.resolve(postUrl)
    window.open(resolvedRoute.href, "_blank")
    return
  }
  await router.push(postUrl)
}

function onActivateReplierLink () {
  emit("onClickReplier")
}

async function onActivateProfileLink (handle: string) {
  await router.push({ name: "profile-post", query: { handle } })
}

function onActivateImageFolderButton () {
  Util.blurElement()
  state.imageFolding = !state.imageFolding
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

async function onRemoveThisPost (uri: string) {
  if (state.processing) return
  state.processing = true
  try {
    await mainState.atp.deletePost(uri)
  } finally {
    state.processing = false
    emit("removeThisPost", uri)
  }
}

async function updateThisPostThread () {
  const posts: null | Array<TTPost> =
    await mainState.atp.fetchPostThread(props.post.uri, 1)
  if (posts == null || posts.length === 0) return
  emit("updateThisPostThread", posts)
}

// 自動翻訳
async function translateText () {
  if (props.post.__translatedText != null) {
    state.translation = "done"
    return
  }
  const text = props.post.record?.text ?? props.post.value?.text
  if (text == null) {
    state.translation = "ignore"
    return
  }
  const srcLanguage = detect(text)
  if (!srcLanguage) {
    state.translation = "ignore"
    return
  }
  const autoTranslationIgnoreLanguage = mainState.currentSetting.autoTranslationIgnoreLanguage
  if (autoTranslationIgnoreLanguage != null) {
    const ignoreLanguages = autoTranslationIgnoreLanguage.replace(/\s/gs, '').split(",")
    const ignored = ignoreLanguages.includes(srcLanguage)
    if (ignored) {
      state.translation = "ignore"
      return
    }
  }
  const dstLanguage = window.navigator.language
  if (srcLanguage === dstLanguage) {
    state.translation = "ignore"
    return
  }
  // SEE: https://mymemory.translated.net/doc/spec.php
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${srcLanguage}|${dstLanguage}&de=${mainState.atp.session?.email}`
  const response = await fetch(url).catch(() => {
    state.translation = "failed"
  })
  if (state.translation === "failed") return
  if (response == null) {
    state.translation = "failed"
    return
  }
  const json = await (response as Response).json()
  if (!(json?.responseData?.translatedText)) {
    state.translation = "failed"
    return
  }
  state.translation = "done"
  props.post.__translatedText = json.responseData.translatedText
}
</script>

<template>
  <div
    class="post"
    ref="postElement"
    :data-cid="post.cid"
    :data-position="position"
    :data-repost="post.__reason != null"
    :data-focus="isFocused()"
    @click.prevent.stop="onActivatePost(post, $event)"
  >
    <div class="header">
      <!-- リプライ先ユーザー -->
      <div
        v-if="replyTo != null"
        class="replier"
        @click.stop="onActivateReplierLink"
      >
        <SVGIcon name="post" />
        <div class="replier__display-name">{{
          !mainState.currentSetting.postAnonymization
            ? replyTo?.author?.displayName
            : $t("anonymous")
        }}</div>
        <div class="replier__handle">{{
          !mainState.currentSetting.postAnonymization
            ? replyTo?.author?.handle
            : ""
        }}</div>
      </div>

      <!-- リポストユーザー -->
      <div
        v-if="post.__reason != null"
        class="reposter"
        @click.stop="onActivateProfileLink(post.__reason?.by?.handle as string)"
      >
        <SVGIcon name="repost" />
        <div class="reposter__display-name">{{
          !mainState.currentSetting.postAnonymization
            ? post.__reason?.by?.displayName
            : $t("anonymous")
        }}</div>
        <div class="reposter__handle">{{
          !mainState.currentSetting.postAnonymization
            ? post.__reason?.by?.handle
            : ""
        }}</div>
      </div>
    </div>
    <div class="body">
      <!-- アバター -->
      <AvatarLink
        v-if="position !== 'postInPost' && position !== 'slim'"
        :handle="post.author?.handle"
        :image="!mainState.currentSetting.postAnonymization ? post.author?.avatar : undefined"
        @click.stop
      />

      <div class="body__right">
        <div class="body__right__header">
          <!-- アバター -->
          <AvatarLink
            v-if="position === 'postInPost' || position === 'slim'"
            class="avatar-in-post"
            :handle="post.author?.handle"
            :image="!mainState.currentSetting.postAnonymization ? post.author?.avatar : undefined"
            @click.stop
          />

          <!-- 表示名 -->
          <div class="display-name">{{
            !mainState.currentSetting.postAnonymization
              ? post.author?.displayName ?? "　"
              : $t("anonymous")
          }}</div>

          <!-- ハンドル -->
          <div class="handle">{{ !mainState.currentSetting.postAnonymization ? post.author?.handle : "" }}</div>

          <!-- ポスト時間 -->
          <div
            v-if="post.indexedAt"
            class="indexed-at"
          >{{ mainState.formatDate(post.indexedAt) }}</div>
        </div>

        <!-- 本文 -->
        <HtmlText
          v-if="position !== 'slim'"
          class="text"
          dir="auto"
          :text="post.record?.text ?? post.value?.text"
          :facets="post.record?.facets ?? post.value?.facets"
          :entities="post.record?.entities ?? post.value?.entities"
        />
        <div
          v-else
          class="text--slim"
          dir="auto"
        >{{ post.record?.text ?? post.value?.text }}</div>

        <!-- 自動翻訳 -->
        <div
          v-if="state.translation !== 'none' && state.translation !== 'ignore'"
          class="translated-text"
          dir="auto"
        >
          <template v-if="state.translation === 'waiting'">（翻訳中）</template>
          <template v-else-if="state.translation === 'failed'">（翻訳に失敗しました）</template>
          <template v-else-if="state.translation === 'done'">{{ props.post.__translatedText }}</template>
        </div>

        <!-- リンクボックス -->
        <LinkBox
          v-if="position !== 'slim'"
          :external="state.external"
          :displayImage="state.displayImage"
        />

        <template v-if="state.images.length > 0 && (level ?? 1) < 3">
          <template v-if="forceHideImages">
            <div class="omit-images">
              <SVGIcon
                v-for="_, index of state.images"
                :key="index"
                name="image"
              />
            </div>
          </template>
          <template v-else-if="position !== 'slim'">
            <!-- 画像フォルダーボタン -->
            <button
              v-if="!state.displayImage"
              class="button--bordered image-folder-button"
              @click.prevent.stop="onActivateImageFolderButton"
            >
              <template v-if="state.imageFolding">
                <SVGIcon name="image" />
                <span>{{ $t("showImage") }}</span>
              </template>
              <template v-else>
                <SVGIcon name="offImage" />
                <span>{{ $t("hideImage") }}</span>
              </template>
            </button>

            <!-- イメージボックス -->
            <div
              v-if="state.displayImage || (!state.displayImage && !state.imageFolding)"
              class="quad-images"
              :data-number-of-images="state.images.length"
            >
              <div
                v-for="image, imageIndex of state.images"
                :key="imageIndex"
                class="quad-image"
              >
                <Thumbnail
                  :key="post.cid"
                  :image="image"
                  :did="post.author.did"
                />
              </div>
            </div>
          </template>
          <template v-else>
            <!-- イメージリスト -->
            <div class="image-list">
              <Thumbnail
                v-for="image, imageIndex of state.images"
                :key="imageIndex"
                :image="image"
                :did="post.author.did"
              />
            </div>
          </template>
        </template>

        <!-- 引用リポスト -->
        <template v-if="post.embed?.record && (post.embed.record as any).$type != null">
          <!-- ブロックされていない -->
          <template v-if="(post.embed.record.$type as string)?.indexOf('#viewBlocked') === - 1">
            <div class="repost">
              <Post
                :level="(level ?? 1) + 1"
                :position="position === 'slim' ? 'slim' : 'postInPost'"
                :post="post.embed.record as TTPost"
              />
            </div>
          </template>

          <!-- ブロックされている -->
          <div
            v-else
            class="notification-message"
          >
            <SVGIcon name="alert" />
            <span>{{ $t("postBlocked") }}</span>
          </div>
        </template>

        <!-- リアクションコンテナ -->
        <div
          v-if="position !== 'postInPost' && position !== 'slim'"
          class="reaction-container"
        >
          <div>
            <!-- リプライボタン -->
            <button
              class="icon-button reply_count"
              :data-has="post.replyCount > 0"
              @click.stop="onActivateReplyButton"
            >
              <SVGIcon name="post" />
              <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.replyCount > 0 ? post.replyCount : "" }}</span>
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
              <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.repostCount > 0 ? post.repostCount : "" }}</span>

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
              <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.likeCount > 0 ? post.likeCount : "" }}</span>
            </button>
          </div>
          <div>
            <!-- Lightning -->
            <a
              v-if="post.record?.lightning"
              class="icon-button--nolabel lightning"
              :href="`lightning:${post.record?.lightning}`"
              rel="noreferrer"
              @click.stop
            >
              <SVGIcon name="lightning" />
            </a>

            <!-- ポストメニューボタン -->
            <button
              class="icon-button--nolabel menu-button"
              @click.stop="onActivatePostMenuTrigger"
            >
              <SVGIcon name="menu" />

              <!-- ポストメニュー -->
              <PostMenuTicker
                :author="post.author"
                :isUser="post.author?.did === mainState.atp.session?.did"
                :did="post.author.did"
                :handle="post.author.handle"
                :uri="post.uri"
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

  // フォーカスされたポスト
  &[data-focus="true"]:not([data-position="preview"]) {
    background-color: rgba(var(--accent-color), 0.125);

    & > .body > .body__right {
      user-select: text;
    }
  }

  // 引用ポスト
  &[data-position="postInPost"] {
    font-size: 0.9375em;
  }

  // プレビューポスト
  &[data-position="preview"] {
    font-size: 0.9375em;
    padding: 0;
    pointer-events: none;

    .external,
    .image-folder-button,
    .quad-images,
    .reaction-container {
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
  display: grid;
  grid-template-columns: var(--avatar-size) 1fr;
  grid-gap: 1em;
  align-items: flex-start;
}
.post[data-position="postInPost"],
.post[data-position="slim"] {
  & > .body {
    display: unset;
  }
}

.avatar-link {
  font-size: var(--avatar-size);
  position: relative;
}

.body__right {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 0.5em;
}

.body__right__header {
  grid-area: h;
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr min-content;
  grid-gap: 0.5em;
  overflow: hidden;
}
.post[data-position="postInPost"],
.post[data-position="slim"] {
  .body__right__header {
    grid-template-columns: auto auto 1fr min-content;
  }
}

.avatar-in-post {
  font-size: 1.5em;
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

.text,
.text--slim {
  line-height: 1.5;
  word-break: break-word;
  &:empty {
    display: contents;
  }
}
.text {
  white-space: pre-wrap;

  // 折り返されたURLの隙間が選択されないようにする
  &:deep(.textlink) {
    padding: 0.125em 0;
  }
}

.translated-text {
  border-top: 1px solid rgba(var(--fg-color), 0.125);
  padding-top: 0.5em;
  color: rgba(var(--fg-color), 0.75);
  font-style: italic;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.omit-images {
  display: flex;
  grid-gap: 0.5em;

  & > .svg-icon {
    fill: rgb(var(--accent-color));
  }
}

.image-folder-button > span {
  font-size: 0.875em;
}

.quad-images {
  grid-area: i;
}

.image-list {
  display: flex;
  grid-gap: 0.5rem;

  & > .thumbnail:deep() {
    border-radius: var(--border-radius);
    cursor: pointer;
    overflow: hidden;

    & > img {
      aspect-ratio: var(--image-aspect-ratio);
      object-fit: cover;
      height: 4rem;
    }

    & > .loader {
      font-size: 0.5rem;
    }
  }
}

.repost {
  grid-area: r;
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);
  &:focus, &:hover {
    border-color: rgba(var(--fg-color), 0.5);
  }

  :not([data-position="slim"]) & > .post {
    padding: 0.875em;
  }
  [data-position="slim"] & > .post {
    padding: 0.5em;
  }
}

.reaction-container {
  grid-area: f;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr; // for Android
  align-items: center;
  &:not(:first-child) {
    margin-top: 0.5em;
  }

  // タブレット幅以上
  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    grid-template-columns: min min min 2fr;
  }

  // タブレット幅未満
  @media not all and (min-width: calc($router-view-width + $main-menu-min-width)) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }

  & > div:last-child {
    display: flex;
    margin-left: auto;
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
    display: contents; // TODO: 外すとティッカー表示時にレイアウト崩れ、外さないとティッカー表示位置が若干ずれる

    .menu-ticker--inner {
      top: 2.5rem;
      left: 0;
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

.lightning {
  --fg-color: 240, 0, 240;
  margin-right: 0.75em;
}

.menu-button {
  margin: -0.75em -1em;
  padding: 0.75em 1.5em;
  position: relative;

  .menu-ticker:deep() {
    & > .menu-ticker--inner {
      top: 2.5rem;
      right: 0.5rem;
    }
  }
}
</style>
