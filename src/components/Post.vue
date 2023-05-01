<script lang="ts" setup>
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
// TODO: 適切なパスで記述すること
import { detect } from "@/../node_modules/tinyld/dist/tinyld.light.node.js"
import AvatarLink from "@/components/AvatarLink.vue"
import HtmlText from "@/components/HtmlText.vue"
import LinkBox from "@/components/LinkBox.vue"
import Loader from "@/components/Loader.vue"
import MenuTicker from "@/components/MenuTicker.vue"
import Post from "@/components/Post.vue"
import PostAndProfileMenuTicker from "@/components/PostAndProfileMenuTicker.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Thumbnail from "@/components/Thumbnail.vue"
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
      <AvatarLink
        v-if="position !== 'postInPost'"
        :handle="post.author?.handle"
        :image="post.author?.avatar"
        @click.stop
      />

      <div class="body__right">
        <div class="body__right__header">
          <!-- アバター -->
          <AvatarLink
            v-if="position === 'postInPost'"
            class="avatar-in-post"
            :handle="post.author?.handle"
            :image="post.author?.avatar"
            @click.stop
          />

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
        <HtmlText
          class="text"
          dir="auto"
          :text="post.record?.text ?? post.value?.text"
          :facets="post.record?.facets ?? post.value?.facets"
          :entities="post.record?.entities ?? post.value?.entities"
        />

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
          :external="state.external"
          :displayImage="state.displayImage"
        />

        <template v-if="state.images.length > 0">
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

        <!-- リアクションコンテナ -->
        <div
          v-if="position !== 'postInPost'"
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
                type="post"
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
.post[data-position="postInPost"] > .body {
  display: unset;
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
.post[data-position="postInPost"] .body__right__header {
  grid-template-columns: auto auto 1fr min-content;
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

.text {
  line-height: 1.5;
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

.translated-text {
  border-top: 1px solid rgba(var(--fg-color), 0.125);
  padding-top: 0.5em;
  color: rgba(var(--fg-color), 0.75);
  font-style: italic;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.image-folder-button > span {
  font-size: 0.875em;
}

.quad-images {
  grid-area: i;
}

.repost {
  grid-area: r;
  border: 1px solid rgba(var(--fg-color), 0.25);
  border-radius: var(--border-radius);

  & > .post {
    padding: 0.875em;
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
  @media (min-width: calc($router-view-width + $main-menu-min-width)) {
    grid-template-columns: min min min 2fr;
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
    display: contents; // TODO: 外すとティッカー表示時にレイアウト崩れ、外さないとティッカー表示位置が若干ずれる

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
