<script lang="ts" setup>
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
import AuthorHandle from "@/components/app-parts/AuthorHandle.vue"
import AvatarLink from "@/components/app-parts/AvatarLink.vue"
import ContentFilteringToggle from "@/components/app-parts/ContentFilteringToggle.vue"
import FeedCard from "@/components/app-parts/FeedCard.vue"
import HtmlText from "@/components/app-parts/HtmlText.vue"
import LikeButton from "@/components/buttons/LikeButton.vue"
import LinkCard from "@/components/app-parts/LinkCard.vue"
import Loader from "@/components/common/Loader.vue"
import MenuTicker from "@/components/menu-tickers/MenuTicker.vue"
import Post from "@/components/app-parts/Post.vue"
import PostMenuTicker from "@/components/menu-tickers/PostMenuTicker.vue"
import RepostButton from "@/components/buttons/RepostButton.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Thumbnail from "@/components/app-parts/Thumbnail.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  level?: number
  position: "post" | "root" | "parent" | "postInPost" | "preview" | "slim"
  post: TTPost
  rootPost?: TTPost
  parentPost?: TTPost
  hasReplyIcon?: boolean
  hasQuoteRepostIcon?: boolean
  isInFeed?: boolean
  noLink?: boolean
  container?: HTMLElement
  forceHideImages?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  postMenuDisplay: boolean
  repostMenuDisplay: boolean
  processing: boolean

  // 本文
  text: ComputedRef<undefined | string>

  // 画像
  images: ComputedRef<Array<TTImage>>
  hasImage: ComputedRef<boolean>
  isImagefreeSize: ComputedRef<boolean>
  displayImage: ComputedRef<boolean>
  foldingImage: boolean

  // リンクカード
  linkCard: ComputedRef<undefined | TTExternal>
  hasLinkCard: ComputedRef<boolean>

  // フィードカード
  hasFeedCard: ComputedRef<boolean>

  // ポストマスクの表示
  masked: ComputedRef<boolean>

  // 対象ポスト言語
  postLanguages: ComputedRef<undefined | Array<string>>

  // 翻訳リンクの設置可否
  hasOtherLanguages: ComputedRef<boolean>

  // コンテンツ言語の判定
  noContentLanguage: ComputedRef<boolean>

  translation: "none" | "ignore" | "waiting" | "done" | "failed";

  // ラベル対応
  allLabels: ComputedRef<Array<TTLabel>>
  appliedHarmfulLabels: ComputedRef<Array<TTLabel>>
  hideLabels: ComputedRef<Array<TTLabel>>
  blurLabels: ComputedRef<Array<TTLabel>>
  blurMediaLabels: ComputedRef<Array<TTLabel>>
  alertLabels: ComputedRef<Array<TTLabel>>
  contentWarningLabels: ComputedRef<Array<string>>
  hasAppliedHarmfulLabel: ComputedRef<boolean>
  hasBlurredContent: ComputedRef<boolean>
  blurredContentClicked: boolean
  postContentDisplay: ComputedRef<boolean>
  hasBlurredMedia: ComputedRef<boolean>
  blurredMediaClicked: boolean
  postMediaDisplay: ComputedRef<boolean>

  // Threadgate
  threadgate: ComputedRef<"none" | "lock" | "unlock">

  // ワードミュートの判定
  isWordMute: ComputedRef<boolean>
}>({
  postMenuDisplay: false,
  repostMenuDisplay: false,
  processing: false,

  // 本文
  text: computed((): undefined | string => {
    return props.post.record?.text ?? props.post.value?.text
  }),

  // 画像
  images: computed(() => props.post.embed?.images ?? []),
  hasImage: computed((): boolean => state.images.length > 0 && (props.level ?? 1) < 3),
  isImagefreeSize: computed((): boolean => mainState.currentSetting.imageOption?.includes(0) ?? false),

  // 画像 - 表示制御
  // TODO: 引用リポストに対応すること
  displayImage: computed((): boolean => {
    // すべて表示
    if (mainState.currentSetting.imageControl === "all") return true

    // 自身とフォロイーとフォロイーのリポスト、およびプロフィールユーザーのみ表示
    if (mainState.currentSetting.imageControl === "followingEx" && (
      // 自身である
      props.post.author?.did === mainState.atp.session?.did ||
      // フォロイーである
      props.post.author.viewer?.following != null ||
      // フォロイーのリポストである
      props.post.__custom?.reason?.by.viewer?.following != null ||
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
      props.post.author.viewer?.following != null
    )) return true

    // 自身のみ表示
    if (mainState.currentSetting.imageControl === "self" &&
      props.post.author?.did === mainState.atp.session?.did) return true

    return false
  }),

  // TODO: displayImage 共々 post に内包するべき
  foldingImage: false,

  // リンクカード
  linkCard: computed(() => props.post.embed?.external),
  hasLinkCard: computed((): boolean => state.linkCard != null && props.position !== 'slim'),

  // フィードカード
  hasFeedCard: computed((): boolean => props.post.embed?.record?.$type === "app.bsky.feed.defs#generatorView"),

  // ポストマスクの表示
  masked: computed((): boolean => {
    return (
      state.noContentLanguage ||
      state.hideLabels.length > 0 ||
      state.isWordMute
    ) && (
      props.position !== "preview" &&
      props.position !== "slim"
    )
  }),

  // 対象ポスト言語
  postLanguages: computed((): undefined | Array<string> => {
    return props.post.record?.langs ?? props.post.value?.langs
  }),

  // 翻訳リンクの設置可否
  hasOtherLanguages: computed((): boolean => {
    if (props.noLink) return false
    if (!state.text) return false
    if (state.postLanguages == null) return false
    if (state.postLanguages.length === 0) return false
    if (state.postLanguages.length >= 2) return true
    const userLanguage = Util.getUserLanguage()
    return state.postLanguages[0] !== userLanguage
  }),

  // コンテンツ言語の判定
  noContentLanguage: computed((): boolean => {
    // コンテンツ言語設定はポストスレッドとプロフィールポストでは無効
    if (mainState.currentPath === "/post" ||
        mainState.currentPath.startsWith("/profile/")) return false

    if (!(mainState.currentSetting.contentLanguages?.length)) return false
    if (!(state.postLanguages?.length)) return false
    return !(state.postLanguages?.some((language: any) =>
      mainState.currentSetting.contentLanguages?.includes(language) ?? false
    ) ?? false)
  }),

  translation: "none",

  // ラベル対応
  allLabels: computed((): Array<TTLabel> => {
    return [
      ...(props.post.author?.labels ?? []),
      ...(props.post.labels ?? [])
    ]
  }),
  appliedHarmfulLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(["hide", "warn"], ["alert", "blur", "blur-media"], state.allLabels)
  }),
  hideLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(["hide"], undefined, state.allLabels)
  }),
  blurLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(["hide", "warn"], ["blur"], state.allLabels)
  }),
  blurMediaLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(["hide", "warn"], ["blur-media"], state.allLabels)
  }),
  alertLabels: computed((): Array<TTLabel> => {
    return mainState.filterLabels(["hide", "warn"], ["alert"], state.allLabels)
  }),
  contentWarningLabels: computed((): Array<string> => {
    return state.hideLabels.map((label: TTLabel) => $t(label.val))
  }),

  // ラベル対応 - 有害なラベル
  hasAppliedHarmfulLabel: computed((): boolean => {
    return state.appliedHarmfulLabels.length > 0
  }),

  // ラベル対応 - ポストコンテンツ
  hasBlurredContent: computed((): boolean => {
    return state.blurLabels.length > 0
  }),
  blurredContentClicked: false,
  postContentDisplay: computed((): boolean => {
    return !state.hasBlurredContent ||
      (
        state.hasBlurredContent &&
        state.blurredContentClicked
      )
  }),

  // ラベル対応 - ポストメディア
  hasBlurredMedia: computed((): boolean => {
    return (
      state.hasImage ||
      state.hasLinkCard ||
      state.hasFeedCard
    ) && state.blurMediaLabels.length > 0
  }),
  blurredMediaClicked: false,
  postMediaDisplay: computed((): boolean => {
    return !state.hasBlurredMedia ||
      (
        state.hasBlurredMedia &&
        state.blurredMediaClicked
      )
  }),

  // Threadgate
  threadgate: computed((): "none" | "lock" | "unlock" => {
    const threadgate = props.post.threadgate as any
    if (threadgate == null) return "none"
    return props.post.viewer?.replyDisabled ? "lock" : "unlock"
  }),

  // ワードミュートの判定
  isWordMute: computed((): boolean => {
    const target = state.text?.toLowerCase() ?? ""
    if (!target) return false
    return mainState.currentSetting.wordMute?.some((wordMute: TTWordMute) => {
      if (!wordMute.enabled[0] || wordMute.keyword === "") return false
      const keywords = wordMute.keyword.toLowerCase().split(",")
      const result = keywords.some((keyword: string) => {
        keyword = keyword.trim()
        return keyword !== "" && target.indexOf(keyword) !== - 1
      })
      return result
    }) ?? false
  }),
})

state.foldingImage = !state.displayImage

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
      translateText(false) // No await
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
  return props.post.uri === mainState.currentQuery.uri
}

async function onActivatePost (post: TTPost, event: Event) {
  // ポストマスクの無効化
  if (!props.post.__custom.unmask && state.masked) {
    props.post.__custom.unmask = true
    return
  }

  if (isFocused() || props.noLink) return
  const postUrl = { name: "post", query: { uri: post.uri } }
  if ((event as any).metaKey || (event as any).ctrlKey) {
    const resolvedRoute = router.resolve(postUrl)
    window.open(resolvedRoute.href, "_blank")
    return
  }
  await router.push(postUrl)
}

function onActivatePostMask () {
  Util.blurElement()

  // ポストマスクのトグル
  props.post.__custom.unmask = !props.post.__custom.unmask
}

function onActivateReplierLink () {
  emit("onClickReplier")
}

async function onActivateProfileLink (did: string) {
  await router.push({ name: "profile-feeds", query: { account: did } })
}

function onActivateImageFolderButton () {
  Util.blurElement()
  state.foldingImage = !state.foldingImage
}

function onActivatePostContentToggle () {
  state.blurredContentClicked = !state.blurredContentClicked
}

function onActivatePostMediaToggle () {
  state.blurredMediaClicked = !state.blurredMediaClicked
}

async function onActivateReplyButton () {
  Util.blurElement()
  const done = await mainState.openSendPostPopup({ type: "reply", post: props.post })
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
  if (props.post.viewer?.repost == null) return
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
  const done = await mainState.openSendPostPopup({ type: "quoteRepost", post: props.post })
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
    if (props.post.viewer?.like != null)
      await mainState.atp.deleteLike(props.post.viewer.like as string)
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

async function onForceTranslate () {
  onClosePostMenu()
  state.processing = true
  try {
    await translateText(true)
  } finally {
    state.processing = false
  }
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

async function updateThisPost () {
  state.processing = true
  if (mainState.currentPath.startsWith("/post")) await mainState.fetchPostThread()
  else await updateThisPostThread()
  state.processing = false
}

async function updateThisPostThread () {
  // レコード更新直後に最新レコードを取得できない現象対策
  // TODO: 原因不明に付き暫定対応、後日再検証すること
  await Util.wait(250)

  const posts: undefined | false | Array<TTPost> =
    await mainState.atp.fetchPosts([props.post.uri])
  if (!posts || posts.length === 0) return
  emit("updateThisPostThread", posts)
}

// 画像ポップアップ
function openImagePopup (imageIndex: number) {
  // ラージ画像のないポスト向け処理（レコードなど）
  if (state.images[imageIndex].fullsize == null) return

  mainState.imagePopupProps.did = props.post.author.did
  mainState.imagePopupProps.images = state.images.map((image: TTImage) => {
    return {
      smallUri: image.thumb ?? "/img/void.png",
      largeUri: image.fullsize ?? "/img/void.png",
      blob: image.image,
    }
  })
  mainState.imagePopupProps.index = imageIndex
  mainState.imagePopupProps.display = true
}

// 自動翻訳
async function translateText (forceTranslate: boolean) {
  if (props.post.__custom.translatedText != null) {
    state.translation = "done"
    return
  }
  const text = state.text
  if (text == null) {
    state.translation = "ignore"
    return
  }
  const srcLanguages = state.postLanguages
  if (!srcLanguages?.length) {
    state.translation = "ignore"
    return
  }
  if (!forceTranslate) {
    const autoTranslationIgnoreLanguage = mainState.currentSetting.autoTranslationIgnoreLanguage
    if (autoTranslationIgnoreLanguage != null) {
      const ignoreLanguages = autoTranslationIgnoreLanguage.replace(/\s/gs, "").split(",")
      const ignored = ignoreLanguages.some((ignore: string) => srcLanguages.includes(ignore))
      if (ignored) {
        state.translation = "ignore"
        return
      }
    }
  }
  const dstLanguage = Util.getUserLanguage()
  if (srcLanguages.length === 1 && srcLanguages[0] === dstLanguage) {
    state.translation = "ignore"
    return
  }
  const langpair = srcLanguages.find((srcLanguage: string) => srcLanguage !== dstLanguage)
  // SEE: https://mymemory.translated.net/doc/spec.php
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}|${dstLanguage}&de=${encodeURIComponent(mainState.atp.session?.email ?? "")}`
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
  props.post.__custom.translatedText = json.responseData.translatedText
}

function onActivateHashTag (text: string) {
  emit("onActivateHashTag", text)
}
</script>

<template>
  <div
    class="post"
    ref="postElement"
    :data-cid="post.cid"
    :data-position="position"
    :data-repost="post.__custom?.reason != null"
    :data-focus="isFocused()"
    :data-has-mask="state.masked"
    :data-is-masked="!post.__custom.unmask && state.masked"
    @click.prevent.stop="onActivatePost(post, $event)"
  >
    <!-- ポストヘッダー -->
    <div
      class="header"
      @click.stop
    >
      <slot name="header-before" />

      <!-- 引用リポスト - リプライ／引用リポストアイコン -->
      <div
        v-if="hasReplyIcon"
        class="reply-icon"
      >
        <SVGIcon name="reply" />
        <span>{{ $t("reply") }}</span>
      </div>
      <div
        v-if="hasQuoteRepostIcon"
        class="quote-repost-icon"
      >
        <SVGIcon name="quoteRepost" />
        <span>{{ $t("quoteRepost") }}</span>
      </div>

      <!-- リプライ先ユーザー -->
      <button
        v-if="parentPost != null"
        class="replier"
        :data-is-following="parentPost?.author?.viewer?.following != null"
        @click.stop="onActivateReplierLink"
      >
        <SVGIcon name="reply" />
        <div class="replier__display-name">{{
          !mainState.currentSetting.postAnonymization
            ? parentPost?.author?.displayName
            : $t("anonymous")
        }}</div>
        <AuthorHandle :handle="parentPost.author?.handle" />
      </button>

      <!-- リポストユーザー -->
      <button
        v-if="post.__custom?.reason != null"
        class="reposter"
        :data-is-following="post.__custom?.reason?.by?.viewer?.following != null"
        @click.stop="onActivateProfileLink(post.__custom?.reason?.by?.did as string)"
      >
        <SVGIcon name="repost" />
        <div class="reposter__display-name">{{
          !mainState.currentSetting.postAnonymization
            ? post.__custom?.reason?.by?.displayName
            : $t("anonymous")
        }}</div>
        <AuthorHandle :handle="post.__custom?.reason?.by?.handle" />
      </button>
    </div>

    <!-- ポストマスク -->
    <button
      v-if="state.masked"
      class="post__mask"
      @click.stop="onActivatePostMask"
    >
      <SVGIcon :name="post.__custom.unmask
        ? 'cursorDown'
        : 'cursorUp'
      " />
      <SVGIcon
        v-show="state.noContentLanguage"
        name="translate"
      />

      <!-- アカウントラベル＆ポストラベル -->
      <template v-if="state.contentWarningLabels.length > 0">
        <SVGIcon name="contentFiltering" />
        <div class="post__mask__content-warning">{{ state.contentWarningLabels.join(", ") }}</div>
      </template>

      <SVGIcon
        v-show="state.isWordMute"
        name="wordMute"
      />
      <div class="post__mask__display-name">{{
        !mainState.currentSetting.postAnonymization
          ? post.author?.displayName
          : $t("anonymous")
      }}</div>
      <div class="post__mask__handle">{{
        !mainState.currentSetting.postAnonymization
          ? post.author?.handle
          : ""
      }}</div>
    </button>

    <!-- ポストボディ -->
    <div
      v-if="post.__custom.unmask || !state.masked"
      class="body"
      :data-is-following="post.author.viewer?.following != null"
    >
      <slot name="body-before" />

      <!-- アバター -->
      <AvatarLink
        v-if="position !== 'postInPost' && position !== 'slim'"
        :did="post.author?.did"
        :image="!mainState.currentSetting.postAnonymization ? post.author?.avatar : undefined"
        @click.stop="$emit('click')"
      />

      <div class="body__right">
        <div class="body__right__header">
          <!-- アバター -->
          <AvatarLink
            v-if="position === 'postInPost' || position === 'slim'"
            class="avatar-in-post"
            :did="post.author?.did"
            :image="!mainState.currentSetting.postAnonymization ? post.author?.avatar : undefined"
            @click.stop="$emit('click')"
          />

          <!-- 表示名 -->
          <div class="display-name">
            <!-- アカウントラベルアイコン -->
            <SVGIcon
              v-if="state.hasAppliedHarmfulLabel"
              name="contentFiltering"
              class="account-label-icon"
            />

            <span>{{
            !mainState.currentSetting.postAnonymization
              ? post.author?.displayName ?? "　"
              : $t("anonymous")}}</span>
          </div>

          <!-- ハンドル -->
          <AuthorHandle :handle="post.author?.handle" />

          <!-- ポスト時間 -->
          <div
            v-if="post.indexedAt"
            class="indexed-at"
          >{{ mainState.formatDate(post.indexedAt) }}</div>
        </div>

        <!-- アラートラベル -->
        <div
          v-if="(state.alertLabels?.length ?? 0) > 0"
          class="labels"
        >
          <div
            v-for="label of state.alertLabels"
            :key="label.val"
            class="labels__item"
          >{{ $t(label.val) }}</div>
          <div class="labels__message">{{ $t("warning") }}</div>
        </div>

        <!-- ポストコンテンツトグル -->
        <ContentFilteringToggle
          v-if="state.hasBlurredContent"
          type="blur"
          :labels="state.blurLabels"
          :display="state.blurredContentClicked"
          :togglable="true"
          @click.prevent.stop="onActivatePostContentToggle"
        />

        <!-- ポストコンテンツ -->
        <div
          v-if="state.postContentDisplay"
          class="post__content"
        >
          <!-- 本文 -->
          <template v-if="state.text !== ''">
            <HtmlText
              v-if="position !== 'slim'"
              class="text"
              dir="auto"
              :text="state.text"
              :facets="post.record?.facets ?? post.value?.facets"
              :entities="post.record?.entities ?? post.value?.entities"
              :processHashTag="false"
              :hasTranslateLink="state.hasOtherLanguages"
              @onActivateHashTag="onActivateHashTag"
              @translate="onForceTranslate"
            />
            <div
              v-else
              class="text--slim"
              dir="auto"
            >{{ state.text }}</div>
          </template>

          <!-- 自動翻訳 -->
          <div
            v-if="state.translation !== 'none' && state.translation !== 'ignore'"
            class="translated-text"
            dir="auto"
          >
            <template v-if="state.translation === 'waiting'">（翻訳中）</template>
            <template v-else-if="state.translation === 'failed'">（翻訳に失敗しました）</template>
            <template v-else-if="state.translation === 'done'">{{ props.post.__custom.translatedText }}</template>
          </div>

          <!-- ポストメディアトグル -->
          <ContentFilteringToggle
            v-if="state.hasBlurredMedia"
            type="blur-media"
            :labels="state.blurMediaLabels"
            :display="state.blurredMediaClicked"
            :togglable="true"
            @click.prevent.stop="onActivatePostMediaToggle"
          />

          <!-- ポストメディア -->
          <template v-if="state.postMediaDisplay">
            <!-- 画像 -->
            <template v-if="state.hasImage">
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
                  <template v-if="state.foldingImage">
                    <SVGIcon name="image" />
                    <span>{{ $t("showImage") }}</span>
                  </template>
                  <template v-else>
                    <SVGIcon name="offImage" />
                    <span>{{ $t("hideImage") }}</span>
                  </template>
                </button>

                <!-- イメージボックス -->
                <template v-if="state.displayImage || (!state.displayImage && !state.foldingImage)">
                  <!-- イメージがひとつだけの場合 -->
                  <Thumbnail
                    v-if="state.images.length === 1 && state.isImagefreeSize"
                    :image="state.images[0]"
                    :did="post.author.did"
                    :hasAspectRatio="!state.isImagefreeSize"
                    :hasTranslateLink="state.hasOtherLanguages"
                    :data-has-no-fullsize="state.images[0].fullsize == null"
                    @click.stop="openImagePopup(0)"
                  />

                  <!-- イメージが複数ある場合 -->
                  <div
                    v-else
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
                        :hasAspectRatio="true"
                        :hasTranslateLink="state.hasOtherLanguages"
                        :data-has-no-fullsize="state.images[imageIndex].fullsize == null"
                        @click.stop="openImagePopup(imageIndex)"
                      />
                    </div>
                  </div>
                </template>
              </template>
              <template v-else>
                <!-- イメージリスト（通知ポップアップ） -->
                <div class="image-list">
                  <Thumbnail
                    v-for="image, imageIndex of state.images"
                    :key="imageIndex"
                    :image="image"
                    :did="post.author.did"
                    :hasAspectRatio="true"
                    @click.stop="openImagePopup(imageIndex)"
                  />
                </div>
              </template>
            </template>

            <!-- リンクカード -->
            <LinkCard
              v-if="state.hasLinkCard"
              :external="state.linkCard as TTExternal"
              :displayImage="state.displayImage && !forceHideImages"
            />

            <!-- フィードカード -->
            <FeedCard
              v-if="state.hasFeedCard"
              :generator="post.embed?.record as unknown as TTFeedGenerator"
              :menuDisplay="true"
              :orderButtonDisplay="false"
              :creatorDisplay="true"
              @click="$emit('click')"
              @onActivateMention="$emit('click')"
              @onActivateHashTag="$emit('click')"
            />
          </template>

          <!-- ポストタグ -->
          <div
            v-if="
              post.record?.tags != null &&
              position !== 'postInPost' &&
              position !== 'preview' &&
              position !== 'slim'
            "
            class="post-tag-container"
          >
            <RouterLink
              v-for="postTag of post.record.tags"
              :to="`/search/post?text=${encodeURIComponent(postTag)}`"
              class="post-tag"
              @click.prevent.stop
            >
              <SVGIcon name="tag" />
              <span>{{ postTag }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- 引用リポスト -->
        <template v-if="post.embed?.record != null">
          <!-- 引用リポスト - 見つからない -->
          <div
            v-if="post.embed.record.$type === 'app.bsky.embed.record#viewNotFound'"
            class="textlabel repost"
          >
            <div class="textlabel__text">
              <SVGIcon name="alert" />{{ $t("postNotFound") }}
            </div>
          </div>

          <!-- 引用リポスト - ブロック中／被ブロック中 -->
          <div
            v-else-if="
              post.embed.record.$type === 'app.bsky.embed.record#viewBlocked' ||
              post.embed.record.author?.viewer?.blockedBy ||
              post.embed.record.author?.viewer?.blocking != null
            "
            class="textlabel repost"
          >
            <div class="textlabel__text">
              <SVGIcon name="alert" />{{ $t("postBlocked") }}
            </div>
          </div>

          <!-- 引用リポスト -->
          <template v-else-if="post.embed.record.$type === 'app.bsky.embed.record#viewRecord'">
            <div class="repost">
              <Post
                :level="(level ?? 1) + 1"
                :position="position === 'slim' ? 'slim' : 'postInPost'"
                :post="post.embed.record as TTPost"
                :hasReplyIcon="post.embed.record.value?.reply != null"
                :noLink="noLink"
                @click="$emit('click')"
              />
            </div>
          </template>
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
              :disabled="state.threadgate === 'lock'"
              :data-has="post.replyCount > 0"
              @click.stop="onActivateReplyButton"
            >
              <!-- Threadgate -->
              <SVGIcon
                v-if="state.threadgate === 'lock'"
                name="lock"
              />
              <SVGIcon
                v-else-if="state.threadgate === 'unlock'"
                name="unlock"
              />
              <div v-else class="ignore" />

              <div class="icon-container">
                <SVGIcon name="reply" />
              </div>
              <span v-if="!mainState.currentSetting.hideNumberOfReaction">{{ post.replyCount > 0 ? post.replyCount : "" }}</span>
            </button>
          </div>
          <div>
            <!-- リポストボタン -->
            <RepostButton
              :post="post"
              @click.stop="onActivateRepostMenuTrigger"
            >
              <!-- リポストメニュー -->
              <MenuTicker
                :display="state.repostMenuDisplay"
                :container="container"
              >
                <button
                  v-if="post.viewer?.repost == null"
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
            </RepostButton>
          </div>
          <div>
            <!-- いいねボタン -->
            <LikeButton
              :post="post"
              @click.stop="onActivateLikeButton"
            />
          </div>
          <div>
            <!-- Lightning -->
            <a
              v-if="post.record?.lightning"
              class="icon-button--nolabel lightning-link"
              :href="`lightning:${post.record?.lightning}`"
              rel="noreferrer"
              @click.stop
            >
              <div class="icon-container">
                <SVGIcon name="lightning" />
              </div>
            </a>

            <!-- ポストメニューボタン -->
            <button
              class="icon-button--nolabel menu-button"
              @click.stop="onActivatePostMenuTrigger"
            >
              <div class="icon-container">
                <SVGIcon name="menu" />
              </div>

              <!-- ポストメニュー -->
              <PostMenuTicker
                :post="post"
                :display="state.postMenuDisplay"
                :container="container"
                @close="onClosePostMenu"
                @removeThisPost="onRemoveThisPost"
                @updateThisPost="updateThisPost"
              />
            </button>
          </div>
        </div>
      </div>

      <slot name="body-after" />
    </div>
    <Loader v-if="state.processing" />
  </div>
</template>

<style lang="scss" scoped>
.post {
  --avatar-size: 3em;

  display: flex;
  flex-direction: column;
  padding: 1em;
  position: relative;

  // フォーカスポスト
  .post-view &[data-focus="true"]:not([data-position="preview"]) {
    background-color: var(--accent-color-0125);

    .body > .body__right {
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
    .content-filtering-toggle,
    .image-folder-button,
    .quad-images,
    .feed-card,
    .reaction-container {
      display: none;
    }
  }

  // マスク
  &[data-is-masked="true"] {
    cursor: pointer;
    padding: 0.75em 1em;
    &[data-position="postInPost"] .post__mask {
      margin: 0;
      padding: 0;
    }
    &:focus, &:hover {
      .post__mask {
        --alpha: 0.75;
      }
    }
  }
  &[data-is-masked="false"] {
    .header:not(:empty) {
      margin-bottom: 0.5em;
    }

    .post__mask {
      margin: -0.75em -1em 0;
      padding: 0.5em 1em;
    }
  }
  &__mask {
    --alpha: 0.5;
    cursor: pointer;
    display: grid;
    grid-template-columns: auto auto auto auto auto auto 1fr;
    align-items: center;
    grid-gap: 0.5em;
    &:focus, &:hover {
      --alpha: 0.75;
    }

    & > .svg-icon {
      fill: rgb(var(--fg-color), var(--alpha));
      font-size: 0.875em;
    }

    & > .svg-icon--contentFiltering,
    & > .svg-icon--wordMute {
      fill: rgb(var(--notice-color), var(--alpha));
    }

    &__content-warning,
    &__display-name,
    &__handle {
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__content-warning {
      color: rgb(var(--notice-color), var(--alpha));
      font-size: 0.875em;
      font-weight: bold;
    }

    &__display-name {
      color: rgb(var(--fg-color), var(--alpha));
      font-size: 0.875em;
      font-weight: bold;
    }

    &__handle {
      color: rgb(var(--fg-color), calc(var(--alpha) - 0.25));
      font-size: 0.75em;
    }
  }

  // リプライライン
  &[data-has-child="true"],
  &[data-has-child="false"] {
    --top: 0.75em;
    --gap: 1em;
    &[data-has-mask="true"] {
      --top: 1.5em;
      --gap: 2em;
    }

    &::before {
      border-radius: var(--border-radius);
      content: "";
      display: block;
      position: absolute;
      top: calc(var(--top) + var(--avatar-size) + var(--gap));
      left: calc(2.5em - 1.5px);
      width: 3px;
      height: calc(100% - var(--avatar-size) - var(--gap) - var(--gap));
    }
  }
  &[data-has-child="true"]::before {
    background-color: var(--fg-color-025);
  }
  &[data-has-child="false"]:not(:last-child)::before {
    background-image: linear-gradient(
      to bottom,
      var(--fg-color-025) 0,
      var(--fg-color-025) 3px,
      transparent 3px
    );
    background-size: 6px 6px;
    background-repeat: repeat-y;
  }
}

.header:not(:empty) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1em;
  margin: -0.75em -1em 0.5em;
  padding: 0.5em 1em 0;
}

// リプライ／引用リポストアイコン
.reply-icon,
.quote-repost-icon {
  display: flex;
  align-items: center;
  grid-gap: 0.25em;
  overflow: hidden;

  & > .svg-icon,
  & > span {
    font-size: 0.875em;
  }
  & > span {
    font-weight: bold;
  }
}
.reply-icon {
  & > .svg-icon {
    fill: rgb(var(--post-color));
  }
  & > span {
    color: rgb(var(--post-color));
  }
}
.quote-repost-icon {
  & > .svg-icon {
    fill: rgb(var(--share-color));
  }
  & > span {
    color: rgb(var(--share-color));
  }
}

.replier,
.reposter {
  cursor: pointer;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  grid-gap: 0.5em;
  margin: -0.75em -1em -0.5em;
  padding: 0.75em 1em 0.5em;

  & > .svg-icon {
    font-size: 0.875em;
  }

  &__display-name {
    font-size: 0.875em;
    font-weight: bold;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

    .author-handle {
      --fg-color-05: var(--fg-color-075);
    }
  }

  & > .svg-icon {
    fill: var(--post-color-075);
  }

  &__display-name {
    color: var(--post-color-075);
  }

  .author-handle {
    --fg-color: var(--post-color);
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

    .author-handle {
      --fg-color-05: var(--fg-color-075);
    }
  }

  & > .svg-icon {
    fill: var(--share-color-075);
  }

  &__display-name {
    color: var(--share-color-075);
  }

  .author-handle {
    --fg-color: var(--share-color);
  }
}

.body {
  display: grid;
  grid-template-columns: var(--avatar-size) 1fr;
  grid-gap: 1em;
  align-items: flex-start;
  position: relative;
}
.post[data-position="postInPost"],
.post[data-position="slim"] {
  .body {
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
  grid-template-columns: auto 1fr auto;
  grid-gap: 0.5em;
  overflow: hidden;
}
.post[data-position="postInPost"],
.post[data-position="slim"] {
  .body__right__header {
    grid-template-columns: auto auto 1fr auto;
  }
}

.avatar-in-post {
  font-size: 1.5em;
}

.display-name {
  display: flex;
  align-items: center;
  grid-gap: 0.5em;
  overflow: hidden;

  .account-label-icon {
    fill: rgb(var(--notice-color));
    font-size: 0.875em;
  }

  & > span {
    color: var(--fg-color-075);
    font-size: 0.875em;
    font-weight: bold;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.indexed-at {
  color: var(--fg-color-05);
  font-size: 0.75em;
  overflow: hidden;
  white-space: nowrap;
}

.labels {
  font-size: 0.875em;
}

.content-filtering-toggle {
  font-size: 0.875em;
}

// ポストコンテンツ
.post__content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  grid-gap: 0.5em;
  position: relative;
  &:empty {
    display: contents;
  }
}

.text,
.text--slim {
  color: rgb(var(--fg-color));
  line-height: var(--line-height);
  word-break: break-word;
  &:empty {
    display: contents;
  }
}
.text {
  white-space: pre-wrap;

  // 折り返されたURLの隙間が選択されないようにする
  &:deep(.textlink) {
    padding-top: 0.125em;
    padding-bottom: 0.125em;
  }
}

.translated-text {
  border-top: 1px solid var(--fg-color-0125);
  padding-top: 0.5em;
  color: var(--fg-color-075);
  font-style: italic;
  line-height: var(--line-height);
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

  // ラージ画像のないポスト向け処理（レコードなど）
  .thumbnail[data-has-no-fullsize="true"] {
    cursor: unset;
  }
}

.image-list {
  display: flex;
  grid-gap: 0.5rem;

  & > .thumbnail:deep() {
    & > img {
      height: 4rem;
    }

    & > .loader {
      font-size: 0.5rem;
    }
  }
}

.repost {
  grid-area: r;
  border: 1px solid var(--fg-color-025);
  border-radius: var(--border-radius);
  &:focus, &:hover {
    border-color: var(--fg-color-0375);
  }

  :not([data-position="slim"]) & > .post {
    padding: 0.875em;
  }
  [data-position="slim"] & > .post {
    padding: 0.5em;
  }

  &.textlabel {
    opacity: 0.5;
    padding: 0.75em 0.75em 0.5em;
  }
}

.feed-card {
  background-color: var(--accent-color-0125);
  border: 1px solid var(--accent-color-025);
  border-radius: var(--border-radius);
  &:focus, &:hover {
    border-color: var(--accent-color-05);
  }
}

.post-tag-container {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.25em;
  &:empty {
    display: contents;
  }

  .post-tag {
    font-size: 0.875em;
    &:focus, &:hover {
      --alpha: 1.0;
      --fg-color: var(--accent-color);
    }
  }
}

.reaction-container {
  grid-area: f;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr; // for Android
  align-items: center;
  &:not(:first-child) {
    margin-top: 0.25em;
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

// リプライボタン
// ほぼ Threadgate 対応
.reply_count {
  grid-template-columns: auto auto 1fr;

  & > .ignore {
    display: none;
  }

  & > .svg-icon--lock {
    fill: var(--fg-color-05);
    margin-top: -0.25em;
  }

  & > .svg-icon--unlock {
    fill: rgb(var(--accent-color));
    margin-top: -0.25em;
  }
}

.repost-button {
  position: relative;

  .menu-ticker:deep() {
    .menu-ticker--inner {
      top: 2.5rem;
      left: 0;
    }
  }
}

.lightning-link {
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
