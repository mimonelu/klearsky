<script lang="ts" setup>
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, type ComputedRef } from "vue"
import { RouterLink, useRouter } from "vue-router"
import { RichText } from "@atproto/api"
import AuthorHandle from "@/components/labels/AuthorHandle.vue"
import AvatarButton from "@/components/buttons/AvatarButton.vue"
import ContentFilteringToggle from "@/components/buttons/ContentFilteringToggle.vue"
import DisplayName from "@/components/labels/DisplayName.vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelTags from "@/components/buttons/LabelTags.vue"
import LikeButton from "@/components/buttons/LikeButton.vue"
import LinkCard from "@/components/cards/LinkCard.vue"
import ListCard from "@/components/cards/ListCard.vue"
import Loader from "@/components/shells/Loader.vue"
import Post from "@/components/compositions/Post.vue"
import QuoteRepostButton from "@/components/buttons/QuoteRepostButton.vue"
import RepostButton from "@/components/buttons/RepostButton.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Thumbnail from "@/components/images/Thumbnail.vue"
import VideoPlayer from "@/components/images/VideoPlayer.vue"
import WordMuteScript from "@/components/next/WordMute/script"
import Util from "@/composables/util"
import { THIRD_PARTY_DOMAIN_LIGHTNING } from "@/consts/consts.json"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  level?: number
  position: "post" | "root" | "parent" | "postInPost" | "preview" | "slim" | "chatMessage"
  post: TTPost
  rootPost?: TTPost
  parentPost?: TTPost
  grandparentAuthor?: TTProfile
  hasReplyIcon?: boolean
  hasQuoteRepostIcon?: boolean
  noLink?: boolean
  noLabelTags?: boolean
  forceHideMedia?: boolean
  forceHideQuoteRepost?: boolean
  forceUpdatePostThread?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  text: ComputedRef<undefined | string>
  isTextOnlyEmoji: ComputedRef<boolean>

  // メディア
  images: ComputedRef<Array<TTImage>>
  video: ComputedRef<undefined | TIVideo>
  videoAspectRatio: ComputedRef<string>
  videoType?: string
  hasMedia: ComputedRef<boolean>
  displayMedia: ComputedRef<boolean>
  foldingMedia: boolean

  // リンクカード
  linkCard: ComputedRef<undefined | TTExternal>
  hasLinkCard: ComputedRef<boolean>

  // フィードカード
  hasFeedCard: ComputedRef<boolean>

  // リストカード
  hasListCard: ComputedRef<boolean>

  // スターターパックカード
  hasStarterPackCard: ComputedRef<boolean>
  pseudoStarterPack: ComputedRef<undefined | TIStarterPack>

  // 最古の引用元ポストかどうか
  isOldestQuotedPost: ComputedRef<boolean>

  // ポストマスクの表示
  masked: ComputedRef<boolean>

  // 対象ポスト言語
  postLanguages: ComputedRef<undefined | Array<string>>

  // 翻訳リンクの設置可否 - 本文用
  hasOtherLanguagesForText: ComputedRef<boolean>

  // 翻訳リンクの設置可否 - alt 用
  hasOtherLanguagesForAlt: ComputedRef<boolean>

  // コンテンツ言語の判定
  noContentLanguage: ComputedRef<boolean>

  translation: "none" | "ignore" | "waiting" | "done" | "failed";

  // ラベル対応
  allLabels: ComputedRef<Array<TTLabel>>
  hideLabels: ComputedRef<Array<TILabelSetting>>
  hideLabelNames: ComputedRef<Array<string>>
  blurContentLabels: ComputedRef<Array<TILabelSetting>>
  blurMediaLabels: ComputedRef<Array<TILabelSetting>>
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
  processing: false,
  text: computed((): undefined | string => {
    return props.post.record?.text ?? props.post.value?.text
  }),

  // デカ絵文字
  isTextOnlyEmoji: computed((): boolean => {
    return state.text?.match(/^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}){1,7}$/u) != null
  }),

  // メディア
  images: computed(() => {
    return props.post.embed?.images ?? props.post.record?.embed?.images ?? []
  }),
  video: computed(() => {
    const embed = props.post.embed ?? props.post.record?.embed
    return embed == null
      ? undefined
      : embed.$type?.startsWith("app.bsky.embed.video")
        ? embed as unknown as TIVideo
        : (embed.media as unknown as TIVideo)?.$type?.startsWith("app.bsky.embed.video")
          ? embed.media as unknown as TIVideo
          : undefined
  }),
  videoAspectRatio: computed((): string => {
    if (state.video?.aspectRatio == null ||
        state.video.aspectRatio.width == null ||
        state.video.aspectRatio.height == null
    ) {
      return "unset"
    }
    const aspectHeight = state.video.aspectRatio.height / state.video.aspectRatio.width
    if (!mainState.currentSetting.imageMaxHeightRatio) {
      return `1 / ${aspectHeight}`
    }
    const computedHeight = Math.min(
      aspectHeight,
      mainState.currentSetting.imageMaxHeightRatio
    )
    return `1 / ${computedHeight}`
  }),
  videoType: undefined,
  hasMedia: computed((): boolean => state.images.length > 0 || state.video != null),

  // メディアの折り畳み
  // TODO: 引用リポストに対応すること
  displayMedia: computed((): boolean => {
    // なし - すべて表示
    if (mainState.currentSetting.imageFolding === "none") return true

    // 適度 - 自身とフォロイーとフォロイーのリポスト、およびプロフィールユーザーのみ表示
    else if (mainState.currentSetting.imageFolding === "recommended") {
      if (
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
      ) return true
    }

    // すべて - 自身以外
    else if (mainState.currentSetting.imageFolding === "all") {
      if (props.post.author?.did === mainState.atp.session?.did) return true
    }

    return false
  }),

  // TODO: displayMedia 共々 post に内包するべき
  foldingMedia: false,

  // リンクカード
  linkCard: computed(() => props.post.embed?.external ?? props.post.record?.embed?.external),
  hasLinkCard: computed((): boolean => state.linkCard != null && props.position !== 'slim'),

  // フィードカード
  hasFeedCard: computed((): boolean => props.post.embed?.record?.$type === "app.bsky.feed.defs#generatorView"),

  // リストカード
  hasListCard: computed((): boolean => props.post.embed?.record?.$type === "app.bsky.graph.defs#listView"),

  // スターターパックカード
  hasStarterPackCard: computed((): boolean => props.post.embed?.record?.$type === "app.bsky.graph.starterpack"),
  pseudoStarterPack: computed((): undefined | TIStarterPack => {
    if (!state.hasStarterPackCard ||
        props.post.embed?.record == null ||
        props.post.record?.embed?.record == null
    ) {
      return
    }
    const uri = props.post.record.embed.record.uri ?? ""
    const did = (uri.match(/at:\/\/([^\/]+)/) ?? ["", ""])[1]
    return {
      uri,
      cid: props.post.record.embed.record.cid ?? "",
      record: props.post.embed.record as any,
      creator: {
        did,
        displayName: "",
        handle: "",
        viewer: { muted: false },
      },
      listItemCount: undefined,
      joinedWeekCount: undefined,
      joinedAllTimeCount: undefined,
      labels: undefined,
      indexedAt: props.post.embed.record.createdAt as string,
    }
  }),

  // 最古の引用元ポストかどうか
  isOldestQuotedPost: computed((): boolean => (props.level ?? 1) >= 3 - 1),

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

  // 翻訳リンクの設置可否 - 本文用
  hasOtherLanguagesForText: computed((): boolean => {
    if (props.noLink) return false
    if (!state.text) return false
    if (!state.postLanguages?.length) return false
    const userLanguage = Util.getUserLanguage() ?? "en"
    return state.postLanguages.every((language) => {
      return language !== userLanguage
    })
  }),

  // 翻訳リンクの設置可否 - alt 用
  hasOtherLanguagesForAlt: computed((): boolean => {
    if (!state.postLanguages?.length) return false
    const userLanguage = Util.getUserLanguage() ?? "en"
    return state.postLanguages.every((language) => {
      return language !== userLanguage
    })
  }),

  // コンテンツ言語の判定
  noContentLanguage: computed((): boolean => {
    // コンテンツ言語設定はポストスレッドとプロフィールポストでは無効
    if (mainState.currentPath === "/post" ||
        mainState.currentPath.startsWith("/profile/")
    ) {
      return false
    }

    if (!(mainState.currentSetting.contentLanguages?.length)) {
      return false
    }
    if (!(state.postLanguages?.length)) {
      return false
    }
    return !(state.postLanguages?.some((language: any) => {
      return mainState.currentSetting.contentLanguages?.includes(language) ?? false
    }) ?? false)
  }),

  translation: "none",

  // ラベル対応
  allLabels: computed((): Array<TTLabel> => {
    return [
      ...(props.post.author?.labels ?? []),
      ...(props.post.labels ?? [])
    ]
  }),
  hideLabels: computed((): Array<TILabelSetting> => {
    return mainState.myLabeler!.getSpecificLabels(state.allLabels, ["hide"], ["none", "content", "media"])
  }),
  hideLabelNames: computed((): Array<string> => {
    return state.hideLabels.map((label) => {
      return $t(label.locale?.name || label.definition?.identifier || "")
    })
  }),
  blurContentLabels: computed((): Array<TILabelSetting> => {
    return mainState.myLabeler!.getSpecificLabels(state.allLabels, ["hide", "warn"], ["none", "content"])
  }),
  blurMediaLabels: computed((): Array<TILabelSetting> => {
    return mainState.myLabeler!.getSpecificLabels(state.allLabels, ["hide", "warn"], ["media"])
  }),

  // ラベル対応 - ポストコンテンツ
  hasBlurredContent: computed((): boolean => {
    return state.blurContentLabels.length > 0
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
      state.hasMedia ||
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
    if (threadgate == null) {
      return "none"
    }
    return props.post.viewer?.replyDisabled ? "lock" : "unlock"
  }),

  // ワードミュートの判定
  isWordMute: computed((): boolean => {
    return WordMuteScript.includes(
      contentRichText,
      mainState.currentSetting.wordMute,
      props.post.author.viewer?.following != null
    )
  }),
})

state.foldingMedia = !state.displayMedia

const router = useRouter()

const postElement = ref()

// 本文とワードミュート用に RichText を生成
const contentRichText = (() => {
  const facets = props.post.record?.facets ?? props.post.value?.facets
  const richText = new RichText({
    text: state.text ?? "",
    facets,
  }, {
    cleanNewlines: true,
  })
  if (facets == null) {
    richText.detectFacetsWithoutResolution()
  }
  return richText
})()

// 自動翻訳
const observer = mainState.currentSetting.autoTranslation
  ? new IntersectionObserver((items) => {
    items.forEach((item) => {
      if (!item.isIntersecting) {
        return
      }
      const cid = item.target.getAttribute("data-cid")
      if (cid !== props.post.cid || state.translation !== "none") {
        return
      }
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
  if (!props.post.__custom?.unmask && state.masked) {
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
  if (props.post.__custom != null) {
    props.post.__custom.unmask = !props.post.__custom.unmask
  }
}

function onActivateReplierLink () {
  emit("onClickReplier")
}

async function onActivateProfileLink (did: string) {
  await router.push({ name: "profile-feeds", query: { account: did } })
}

function onActivateImageFolderButton () {
  state.foldingMedia = !state.foldingMedia
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
      if (mainState.currentPath.startsWith("/post")) {
        await mainState.fetchPostThread()
      } else {
        await updatePostThread()
      }
    }
  } finally {
    state.processing = false
  }
}

async function onActivateRepostButton () {
  Util.blurElement()
  if (props.post.viewer?.repost == null) {
    await createRepost()
  } else {
    await deleteRepost()
  }
}

async function createRepost () {
  Util.blurElement()
  const result = await mainState.openConfirmationPopup({
    title: $t("createRepost"),
    text: $t("createRepostConfirmation"),
    post: props.post,
  })
  if (!result) {
    return
  }
  state.processing = true
  const response = await mainState.atp.createRepost(
    props.post.uri,
    props.post.cid
  )
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "Post/createRepost")
    state.processing = false
    return
  }
  await updatePostThread()
  state.processing = false
}

async function deleteRepost () {
  Util.blurElement()
  if (props.post.viewer?.repost == null) {
    return
  }
  const result = await mainState.openConfirmationPopup({
    title: $t("deleteRepost"),
    text: $t("deleteRepostConfirmation"),
    post: props.post,
  })
  if (!result) {
    return
  }
  state.processing = true
  const response = await mainState.atp.deleteRepost(props.post.viewer.repost)
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "Post/deleteRepost")
    state.processing = false
    return
  }
  await updatePostThread()
  state.processing = false
}

async function createQuoteRepost () {
  await mainState.openSendPostPopup({
    type: "quoteRepost",
    post: props.post,
  })

  /* // TODO: 引用リポスト送信完了後に該当ポストを更新すること
  const done = await mainState.openSendPostPopup({
    type: "quoteRepost",
    post: props.post,
  })
  state.processing = true
  try {
    if (done) {
      await updatePostThread()
    }
  } finally {
    state.processing = false
  }
  */
}

async function onActivateLikeButton () {
  if (state.processing) {
    return
  }
  Util.blurElement()
  state.processing = true
  const response = props.post.viewer?.like != null
    ? await mainState.atp.deleteLike(props.post.viewer.like as string)
    : await mainState.atp.createLike(props.post.uri, props.post.cid)
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "Post/onActivateLikeButton")
    state.processing = false
    return
  }
  await updatePostThread()
  state.processing = false
}

function openPostPopover ($event: Event) {
  Util.blurElement()
  mainState.postPopoverProps.post = props.post
  mainState.postPopoverCallback = postPopoverCallback
  mainState.openPostPopover($event.target)
}

async function postPopoverCallback (type: "deletePost" | "updatePost" | "createCustomBookmark" | "deleteCustomBookmark") {
  switch (type) {
    case "deletePost": {
      await deletePost(props.post.uri)
      break
    }
    case "updatePost": {
      await updatePost()
      break
    }
    case "createCustomBookmark": {
      await createCustomBookmark(props.post.uri, props.post.cid)
      break
    }
    case "deleteCustomBookmark": {
      await deleteCustomBookmark(props.post.uri)
      break
    }
  }
}

async function onForceTranslate () {
  state.processing = true
  try {
    await translateText(true)
  } finally {
    state.processing = false
  }
}

function onTranslateVideoAlt () {
  if (state.video?.alt != null) {
    Util.translateInExternalService(state.video.alt)
  }
}

async function deletePost (uri: string) {
  if (state.processing) {
    return
  }
  state.processing = true
  const response = await mainState.atp.deletePost(uri)
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "Post/deletePost")
    return
  }
  emit("removeThisPost", uri)
}

async function updatePost () {
  state.processing = true
  if (mainState.currentPath.startsWith("/post")) {
    await mainState.fetchPostThread()

    // 引用リポスト一覧からの Postgate 操作用
    if (props.forceUpdatePostThread) {
      await updatePostThread()
    }
  } else {
    await updatePostThread()
  }
  state.processing = false
}

async function updatePostThread () {
  // レコード更新直後に最新レコードを取得できない現象対策
  // TODO: 原因不明に付き暫定対応、後日再検証すること
  await Util.wait(375)

  const posts = await mainState.atp.fetchPosts([props.post.uri])
  if (posts instanceof Error) {
    mainState.openErrorPopup(posts, "Post/updatePostThread")
    return
  }
  if (posts.length === 0) {
    return
  }
  emit("updateThisPostThread", posts)
}

async function createCustomBookmark (uri: string, cid: string) {
  if (state.processing) {
    return
  }
  state.processing = true
  const tags = ["demo"]
  const response = await mainState.atp.updateCustomBookmarks(uri, cid, tags)
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "Post/createCustomBookmark")
    return
  }
  if (mainState.currentCustomBookmarkPacks.every((pack) => {
    return pack.bookmark.uri !== uri
  })) {
    mainState.currentCustomBookmarkPacks.unshift({
      bookmark: {
        createdAt: new Date().toISOString(),
        uri: props.post.uri,
        cid: props.post.cid,
        tags,
      },
      post: props.post,
    })
  }

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("customBookmarkPacks", mainState.currentCustomBookmarkPacks)
}

async function deleteCustomBookmark (uri: string) {
  if (state.processing) {
    return
  }
  state.processing = true
  const response = await mainState.atp.deleteCustomBookmark(uri)
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "Post/deleteCustomBookmark")
    return
  }
  mainState.currentCustomBookmarkPacks = mainState.currentCustomBookmarkPacks
    .filter((pack) => {
      return pack.bookmark.uri !== uri
    })

  // セッションキャッシュの設定
  mainState.myWorker!.setSessionCache("customBookmarkPacks", mainState.currentCustomBookmarkPacks)
}

// 画像ポップアップ
function openImagePopup (imageIndex: number) {
  if (state.images[imageIndex].fullsize == null &&
      state.images[imageIndex].image == null
  ) {
    return
  }
  mainState.imagePopupProps.did = props.post.author.did
  mainState.imagePopupProps.images = state.images.map((image: TTImage) => {
    const result: TTImagePopupPropsImages = {
      smallUri: image.thumb ?? "/img/void.png",
      largeUri: image.fullsize ?? "/img/void.png",
    }

    // 表示速度向上のため JPEG と PNG のみ blob を参照しない
    if (image.fullsize == null ||
      (
        image.image?.mimeType !== "image/jpeg" &&
        image.image?.mimeType !== "image/png"
      )
    ) {
      result.blob = image.image
    }

    return result
  })
  mainState.imagePopupProps.alts = state.images.map((image: TTImage) => image.alt)
  mainState.imagePopupProps.index = imageIndex
  mainState.imagePopupProps.display = true
}

function updateVideoType (videoType: string) {
  state.videoType = videoType
}

// 自動翻訳
async function translateText (forceTranslate: boolean) {
  if (props.post.__custom?.translatedText != null) {
    state.translation = "done"
    return
  }
  if (state.text == null) {
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
      const ignoreLanguages = autoTranslationIgnoreLanguage.replace(/\s/g, "").split(",")
      const ignored = ignoreLanguages.some((ignore: string) => srcLanguages.includes(ignore))
      if (ignored) {
        state.translation = "ignore"
        return
      }
    }
  }
  const dstLanguage = Util.getUserLanguage() ?? "en"
  if (srcLanguages.length === 1 && srcLanguages[0] === dstLanguage) {
    state.translation = "ignore"
    return
  }
  const langpair = srcLanguages.find((srcLanguage: string) => srcLanguage !== dstLanguage)
  const response: Error | string = await Util.translateInMyMemory({
    text: state.text,
    langpair,
    dstLanguage,
    email: mainState.atp.session?.email,
  })
  if (response instanceof Error) {
    state.translation = "failed"
    return
  }
  state.translation = "done"
  if (props.post.__custom != null) {
    props.post.__custom.translatedText = response
  }
}

// マイリストの削除
async function deleteList (list: TTList) {
  if (!mainState.myLists!.remove(list.uri)) {
    return
  }

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("myList", mainState.myLists!.items)

  delete props.post.embed?.record
}

function onActivateHashTag (text: string) {
  emit("onActivateHashTag", text)
}

// 最古の引用元ポストをトグル
function toggleOldestQuotedPostDisplay () {
  Util.blurElement()
  if (props.post.__custom != null) {
    props.post.__custom.oldestQuotedPostDisplay = !props.post.__custom.oldestQuotedPostDisplay
  }
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
    :data-has-grandparent-author="grandparentAuthor != null"
    :data-is-masked="!(post.__custom?.unmask) && state.masked"
    @click.prevent.stop="onActivatePost(post, $event)"
  >
    <slot name="post-before" />

    <!-- ポストヘッダー -->
    <div
      v-if="position !== 'preview'"
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
      <template v-if="parentPost != null">
        <!-- リプライ先ポストは存在しない -->
        <div
          v-if="parentPost.notFound"
          class="replier"
          disabled="true"
        >
          <SVGIcon name="reply" />
          <span>{{ $t("replyUnknown") }}</span>
        </div>

        <!-- リプライ先ポストは存在する -->
        <button
          v-else
          class="replier"
          @click.stop="onActivateReplierLink"
        >
          <SVGIcon name="reply" />
          <DisplayName
            class="replier__display-name"
            :displayName="parentPost.author?.displayName"
            :anonymizable="true"
          />
          <AuthorHandle
            :handle="parentPost.author?.handle"
            :anonymizable="true"
          />
        </button>
      </template>

      <!-- リプライ先のリプライ先 -->
      <div
        v-if="grandparentAuthor != null"
        class="replier"
        disabled="true"
      >
        <SVGIcon name="reply" />
        <DisplayName
          class="replier__display-name"
          :displayName="grandparentAuthor.displayName"
          :anonymizable="true"
        />
        <AuthorHandle
          :handle="grandparentAuthor.handle"
          :anonymizable="true"
        />
      </div>

      <!-- リポストユーザー -->
      <button
        v-if="post.__custom?.reason != null"
        class="reposter"
        @click.stop="onActivateProfileLink(post.__custom?.reason?.by?.did as string)"
      >
        <SVGIcon name="repost" />
        <DisplayName
          class="reposter__display-name"
          :displayName="post.__custom?.reason?.by?.displayName"
          :anonymizable="true"
        />
        <AuthorHandle
          :handle="post.__custom?.reason?.by?.handle"
          :anonymizable="true"
        />
      </button>
    </div>

    <!-- ポストマスク -->
    <button
      v-if="state.masked"
      class="post__mask"
      @click.stop="onActivatePostMask"
    >
      <SVGIcon :name="post.__custom?.unmask
        ? 'cursorDown'
        : 'cursorUp'
      " />
      <SVGIcon
        v-show="state.noContentLanguage"
        name="translate"
      />

      <!-- アカウントラベル＆ポストラベル -->
      <template v-if="state.hideLabelNames.length > 0">
        <SVGIcon name="contentFiltering" />
        <div class="post__mask__content-warning">{{ state.hideLabelNames.join(", ") }}</div>
      </template>

      <SVGIcon
        v-show="state.isWordMute"
        name="wordMute"
      />
      <DisplayName
        class="post__mask__display-name"
        :displayName="post.author?.displayName"
        :anonymizable="true"
      />
      <!-- TODO: -->
      <div class="post__mask__handle">{{
        !mainState.currentSetting.postAnonymization
          ? post.author?.handle
          : ""
      }}</div>
    </button>

    <!-- ポストボディ -->
    <div
      v-if="post.__custom?.unmask || !state.masked"
      class="body"
    >
      <slot name="body-before" />

      <!-- アバターリンク -->
      <AvatarButton
        v-if="position !== 'chatMessage' && position !== 'postInPost' && position !== 'slim'"
        :isLabeler="post.author?.associated?.labeler"
        :did="post.author?.did"
        :image="post.author?.avatar"
        @click.stop="$emit('click', $event)"
      />

      <div class="body__right">
        <div class="body__right__header">
          <!-- アバターリンク -->
          <AvatarButton
            v-if="position === 'chatMessage' || position === 'postInPost' || position === 'slim'"
            class="body__right__header__avatar-in-post"
            :did="post.author?.did"
            :image="post.author?.avatar"
            :isLabeler="post.author?.associated?.labeler"
            :noLink="position === 'chatMessage'"
            @click.stop="$emit('click', $event)"
          />

          <!-- 表示名 -->
          <div class="body__right__header__display-name">
            <RouterLink
              :to="{ name: 'profile-feeds', query: { account: post.author?.did } }"
              @click.stop
            >
              <DisplayName
                :displayName="(
                  position === 'chatMessage'
                    ? (post.author?.displayName || post.author?.handle)
                    : post.author?.displayName
                ) || '　'"
                :anonymizable="true"
              >
                <!-- ラベラーアイコン -->
                <template v-if="post.author?.associated?.labeler">
                  <SVGIcon
                    :name="mainState.myLabeler?.isSubscribed(post.author?.did) ? 'labeler' : 'labelerOff'"
                    class="account-labeler-icon"
                  />
                </template>
              </DisplayName>
            </RouterLink>
          </div>

          <div class="body__right__header__detail">
            <!-- ハンドル -->
            <AuthorHandle
              class="body__right__header__author-handle"
              :handle="post.author?.handle"
              :anonymizable="true"
            />

            <SVGIcon
              class="body__right__header__point"
              name="point"
            />

            <!-- ポスト時間 -->
            <div
              v-if="post.indexedAt"
              class="body__right__header__indexed-at"
            >{{ mainState.formatDate(post.indexedAt) }}</div>
          </div>

          <!-- ポストポップオーバートリガー -->
          <button
            v-if="
              position !== 'chatMessage' &&
              position !== 'postInPost' &&
              position !== 'preview' &&
              position !== 'slim'
            "
            class="icon-button--nolabel body__right__header__menu-button"
            @click.stop="openPostPopover"
          >
            <div class="icon-container">
              <SVGIcon name="menu" />
            </div>
          </button>

          <slot name="header-after" />
        </div>

        <!-- ポストコンテンツトグル -->
        <ContentFilteringToggle
          v-if="state.hasBlurredContent"
          type="blur"
          :labels="state.blurContentLabels"
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
              :richText="contentRichText"
              :hasTranslateLink="state.hasOtherLanguagesForText"
              :data-is-text-only-emoji="state.isTextOnlyEmoji"
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
            <template v-else-if="state.translation === 'done'">{{ props.post.__custom?.translatedText }}</template>
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
            <template v-if="state.hasMedia">
              <template v-if="forceHideMedia">
                <div class="omit-images">
                  <SVGIcon
                    v-for="_, index of state.images"
                    :key="index"
                    name="image"
                  />
                </div>
              </template>
              <template v-else-if="position !== 'slim'">
                <!-- メディアフォルダーボタン -->
                <button
                  v-if="!state.displayMedia"
                  class="button--bordered image-folder-button"
                  @click.prevent.stop="onActivateImageFolderButton"
                >
                  <template v-if="state.foldingMedia">
                    <SVGIcon name="image" />
                    <span>{{ $t("showImage") }}</span>
                  </template>
                  <template v-else>
                    <SVGIcon name="offImage" />
                    <span>{{ $t("hideImage") }}</span>
                  </template>
                </button>

                <!-- メディアボックス -->
                <template v-if="state.displayMedia || (!state.displayMedia && !state.foldingMedia)">
                  <!-- 画像 -->
                  <div
                    v-if="state.images.length > 0"
                    class="quad-images"
                    :data-number-of-images="state.images.length"
                  >
                    <div
                      v-for="image, imageIndex of state.images"
                      :key="imageIndex"
                      class="quad-image"
                    >
                      <Thumbnail
                        :image="image"
                        :did="post.author.did"
                        :hasTranslateLink="state.hasOtherLanguagesForAlt"
                        @click.stop="openImagePopup(imageIndex)"
                      />
                    </div>
                  </div>

                  <!-- 動画 -->
                  <div
                    v-if="state.video != null"
                    class="video-container"
                  >
                    <VideoPlayer
                      :playlist="state.video.playlist"
                      :did="post.author.did"
                      :cid="state.video.cid ?? state.video.video?.ref?.toString()"
                      :poster="state.video.thumbnail"
                      :preload="mainState.currentSetting.videoPreload"
                      :style="{ 'aspect-ratio': state.videoAspectRatio }"
                      @updateVideoType="updateVideoType"
                      @click.stop
                    />
                    <p
                      v-if="state.videoType === 'blob'"
                      class="video-container__message"
                    >{{ $t("videoIsBlob") }}</p>
                    <p
                      v-else-if="state.videoType === 'none'"
                      class="video-container__message"
                    >{{ $t("videoIsNone") }}</p>
                    <HtmlText
                      v-if="state.video.alt"
                      class="video-container__alt"
                      dir="auto"
                      :text="state.video.alt"
                      :hasTranslateLink="state.hasOtherLanguagesForText"
                      @onActivateHashTag="onActivateHashTag"
                      @translate="onTranslateVideoAlt"
                    />
                  </div>
                </template>
              </template>
              <template v-else>
                <!-- イメージリスト（通知ポップアップ） -->
                <div
                  v-if="state.images.length > 0"
                  class="image-list"
                >
                  <Thumbnail
                    v-for="image, imageIndex of state.images"
                    :key="imageIndex"
                    :image="image"
                    :did="post.author.did"
                    @click.stop="openImagePopup(imageIndex)"
                  />
                </div>
              </template>
            </template>

            <!-- リンクカード -->
            <LinkCard
              v-if="state.hasLinkCard"
              :external="state.linkCard as TTExternal"
              :layout="mainState.currentSetting.linkcardLayout ?? 'vertical'"
              :displayImage="!forceHideMedia"
              :noLink="false"
              :noEmbedded="forceHideMedia === true"
            />

            <!-- フィードカード -->
            <FeedCard
              v-if="state.hasFeedCard"
              :generator="post.embed?.record as unknown as TTFeedGenerator"
              :menuDisplay="true"
              :detailDisplay="false"
              :orderButtonDisplay="false"
              :creatorDisplay="true"
              @click="$emit('click', $event)"
              @onActivateMention="$emit('click', $event)"
              @onActivateHashTag="$emit('click', $event)"
            />

            <!-- リストカード -->
            <ListCard
              v-if="state.hasListCard"
              :list="(post.embed as any).record"
              :menuDisplay="true"
              :detailDisplay="false"
              :orderButtonDisplay="false"
              @click.prevent.stop
              @deleteList="deleteList"
              @onActivateMention="$emit('click', $event)"
              @onActivateHashTag="$emit('click', $event)"
            />

            <!-- スターターパックカード -->
            <StarterPackCard
              v-if="state.hasStarterPackCard && state.pseudoStarterPack != null"
              :starterPack="state.pseudoStarterPack"
              :menuDisplay="true"
              :detailDisplay="false"
              :creatorDisplay="true"
              :unclickable="false"
              @onActivateMention="$emit('click', $event)"
              @onActivateHashTag="$emit('click', $event)"
            />
          </template>
        </div>

        <!-- ラベルタグ -->
        <LabelTags
          v-if="!noLabelTags && position !== 'preview' && position !== 'slim'"
          :labels="state.allLabels"
          :labelerDisplay="false"
          :unauthenticatedDisplay="false"
          :harmfulDisplay="false"
          :customDisplay="false"
        />

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

          <!-- 引用リポスト - 切断時 -->
          <template v-else-if="
            post.embed.record.$type === 'app.bsky.embed.record#viewDetached' &&
            !forceHideQuoteRepost
          ">
            <!-- 引用リポスト - 切断時 - 自身のポスト -->
            <RouterLink
              v-if="post.embed.record.uri.startsWith(`at://${mainState.atp.session?.did}/`)"
              :to="{ name: 'post', query: { uri: post.embed.record.uri } }"
              class="textlabel repost"
              @click.prevent.stop
            >
              <div class="textlabel__text--alert">
                <SVGIcon name="alert" />{{ $t("postDetachedBySelf") }}
              </div>
            </RouterLink>

            <!-- 引用リポスト - 切断時 - 他ユーザーのポスト -->
            <div
              v-else
              class="textlabel repost"
            >
              <div class="textlabel__text">
                <SVGIcon name="alert" />{{ $t("postDetachedByOther") }}
              </div>
            </div>
          </template>

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
          <template v-else-if="
            post.embed.record.$type === 'app.bsky.embed.record#viewRecord' &&
            !forceHideQuoteRepost
          ">
            <!-- 最古の引用元ポストトグル -->
            <div
              v-if="state.isOldestQuotedPost"
              class="oldest-quoted-post-toggle"
            >
              <button
                class="button--plane"
                @click.prevent.stop="toggleOldestQuotedPostDisplay"
              >
                <template v-if="post.__custom?.oldestQuotedPostDisplay">
                  <SVGIcon name="cursorUp" />
                  <span>{{ $t("hideOldestQuotedPost") }}</span>
                </template>
                <template v-else>
                  <SVGIcon name="cursorDown" />
                  <span>{{ $t("showOldestQuotedPost") }}</span>
                </template>
              </button>
            </div>

            <div v-if="
              !state.isOldestQuotedPost ||
              (
                state.isOldestQuotedPost &&
                post.__custom?.oldestQuotedPostDisplay
              )
            "
              class="repost"
            >
              <Post
                :level="(level ?? 1) + 1"
                :position="position === 'chatMessage'
                  ? 'postInPost'
                  : position === 'slim'
                    ? 'slim'
                    : 'postInPost'
                "
                :post="post.embed.record as TTPost"
                :hasReplyIcon="post.embed.record.value?.reply != null"
                :noLink="position === 'chatMessage' ? false : noLink"
                @click="$emit('click', $event)"
              />
            </div>
          </template>
        </template>

        <!-- リアクションコンテナ -->
        <div
          v-if="
            position !== 'chatMessage' &&
            position !== 'postInPost' &&
            position !== 'slim'
          "
          class="reaction-container"
          :data-has-lightning="!!post.record?.[THIRD_PARTY_DOMAIN_LIGHTNING]"
        >
          <div>
            <!-- リプライボタン -->
            <button
              class="icon-button reply_count"
              :disabled="state.threadgate === 'lock'"
              :data-has-threadgate="state.threadgate !== 'none'"
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
              @click.stop="onActivateRepostButton"
            />
          </div>
          <div>
            <!-- いいねボタン -->
            <LikeButton
              :post="post"
              @click.stop="onActivateLikeButton"
            />
          </div>
          <div>
            <!-- 引用リポストボタン -->
            <QuoteRepostButton
              :post="post"
              @click.stop="createQuoteRepost"
            />
          </div>
          <div>
            <!-- Lightning -->
            <a
              v-if="post.record?.[THIRD_PARTY_DOMAIN_LIGHTNING]"
              class="icon-button--nolabel lightning-link"
              :href="`lightning:${post.record?.[THIRD_PARTY_DOMAIN_LIGHTNING]}`"
              rel="noreferrer"
              @click.stop
            >
              <div class="icon-container">
                <SVGIcon name="lightning" />
              </div>
            </a>
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
  padding: 0.75em;
  position: relative;

  // 引用ポスト
  &[data-position="postInPost"] {
    font-size: 0.9375em;
  }

  // プレビューポスト
  &[data-position="preview"] {
    font-size: 0.875em;
    padding: 0;
    pointer-events: none;

    .external,
    .content-filtering-toggle,
    .image-folder-button,
    .quad-images,
    .video-container,
    .feed-card,
    .list-card,
    .starter-pack-card,
    .reaction-container {
      display: none;
    }
  }

  // マスク
  &[data-is-masked="true"] {
    cursor: pointer;
    &[data-position="postInPost"] .post__mask {
      margin: 0;
      padding: 0;
    }
    &:focus, &:hover {
      .post__mask {
        --alpha: 0.75;
      }
    }

    .header:not(:empty) ~ .post__mask:nth-child(2) {
      margin-top: 0.25em;
    }
  }
  &[data-is-masked="false"] {
    .header:not(:empty) {
      margin-bottom: 0.5em;
    }

    .post__mask {
      margin: -0.75em -0.75em 0;
      padding: 0.75em;
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
    --gap: 0.75em;
    &[data-has-mask="true"],
    &[data-has-grandparent-author="true"] {
      --top: 1.75em;
      --gap: 1.75em;
    }
    &[data-has-mask="true"][data-has-grandparent-author="true"] {
      --top: 2.5em;
      --gap: 2.5em;
    }

    &::before {
      border-radius: var(--border-radius-middle);
      content: "";
      display: block;
      position: absolute;
      top: calc(var(--top) + var(--avatar-size) + var(--gap));
      left: calc(2.25em - 1.5px);
      width: 3px;
      height: calc(100% - var(--avatar-size) - var(--gap) - var(--gap));
    }
  }
  &[data-has-child="true"]::before {
    background-color: rgb(var(--fg-color), 0.25);
  }
  &[data-has-child="false"]:not(:last-child)::before {
    background-image: linear-gradient(
      to bottom,
      rgb(var(--fg-color), 0.25) 0,
      rgb(var(--fg-color), 0.25) 3px,
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
  margin-bottom: 0.25em;
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
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  grid-gap: 0.5em;
  margin: -0.75em -0.75em -0.5em;
  padding: 0.75em;
  &:not([disabled="true"]) {
    cursor: pointer;
  }
  &[disabled="true"] {
    --post-color: var(--fg-color);

    & > .svg-icon {
      fill: rgb(var(--fg-color), 0.5);
    }

    & > span {
      color: rgb(var(--fg-color), 0.5);
      font-size: 0.875em;
    }

    & > .author-handle {
      color: rgb(var(--fg-color), 0.25);
    }
  }

  & > .svg-icon {
    font-size: 0.875em;
  }

  &__display-name {
    font-size: 0.875em;
  }
  &[disabled="true"] > &__display-name {
    color: rgb(var(--fg-color), 0.5);
  }
}

.replier {
  &:not([disabled="true"]) {
    &:focus, &:hover {
      & > .svg-icon {
        fill: rgb(var(--post-color));
      }

      .replier__display-name {
        color: rgb(var(--post-color));
      }
    }
  }

  & > .svg-icon {
    fill: rgb(var(--post-color), 0.75);
  }

  &__display-name {
    color: rgb(var(--post-color), 0.75);
  }

  .author-handle {
    --fg-color: var(--post-color);
  }
}

.reposter {
  &:not([disabled="true"]) {
    &:focus, &:hover {
      & > .svg-icon {
        fill: rgb(var(--share-color));
      }

      .reposter__display-name {
        color: rgb(var(--share-color));
      }
    }
  }

  & > .svg-icon {
    fill: rgb(var(--share-color), 0.75);
  }

  &__display-name {
    color: rgb(var(--share-color), 0.75);
  }

  .author-handle {
    --fg-color: var(--share-color);
  }
}

.body {
  display: grid;
  grid-template-columns: var(--avatar-size) 1fr;
  grid-gap: 0.75em;
  align-items: flex-start;
  position: relative;
}
.post[data-position="chatMessage"],
.post[data-position="postInPost"],
.post[data-position="slim"] {
  .body {
    display: unset;
  }
}

.avatar-button {
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
  grid-template-areas:
    "d m"
    "h m";
  grid-template-columns: 1fr auto;
  grid-gap: 0.125em 0.5em;
  // overflow: hidden;

  &__avatar-in-post {
    grid-area: a;
    font-size: 2em;
  }

  // 表示名
  &__display-name {
    grid-area: d;
    overflow: hidden;

    & > a {
      display: inline-block;
    }

    .display-name {
      color: rgb(var(--fg-color), 0.75);
      display: inline-flex;
      align-items: center;
      grid-gap: 0.5em;
      font-size: 0.875em;
      &:focus, &:hover {
        color: rgb(var(--fg-color));
      }

      // ラベラーアイコン
      .account-labeler-icon {
        fill: rgb(var(--label-color));
      }
    }
  }

  &__detail {
    grid-area: h;
    display: grid;
    align-items: center;
    justify-content: flex-start;
    grid-template-columns: auto auto auto;
    grid-gap: 0.25em;
    overflow: hidden;
  }

  // &__author-handle {}

  &__point {
    fill: rgb(var(--fg-color), 0.25);
    font-size: 0.5em;
  }

  &__indexed-at {
    color: rgb(var(--fg-color), 0.5);
    font-size: 0.75em;
    overflow: hidden;
    white-space: nowrap;
  }

  &__menu-button {
    grid-area: m;
    margin: -0.5em -0.75em -0.5em 0;
    padding: 1em 1em;
    position: relative;
  }
}
.post[data-position="chatMessage"],
.post[data-position="postInPost"],
.post[data-position="slim"] {
  .body__right__header {
    grid-template-areas:
      "a d m"
      "a h m";
    grid-template-columns: auto 1fr auto;
  }
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
  line-height: var(--line-height-high);
  word-break: break-word;
  &:empty {
    display: contents;
  }
}
.text {
  white-space: pre-wrap;

  // 折り返されたURLの隙間が選択されないようにする
  &:deep(.textlink > span) {
    padding-top: 0.125em;
    padding-bottom: 0.125em;
  }

  // デカ絵文字
  &[data-is-text-only-emoji="true"] {
    font-size: 2.5em;
    line-height: 1;
  }
}

.translated-text {
  border-top: 1px solid rgb(var(--fg-color), 0.125);
  padding-top: 0.5em;
  color: rgb(var(--fg-color), 0.75);
  font-style: italic;
  line-height: var(--line-height-high);
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

.quad-images,
.video-container {
  grid-area: i;
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

.video-container {
  position: relative;

  & > video {
    background-color: rgb(var(--fg-color), 0.125);
    border: 1px solid rgb(var(--fg-color), 0.25);
    border-radius: var(--border-radius-middle);
    overflow: hidden;
    max-height: 75vh;
  }

  &__message {
    background-color: rgb(var(--notice-color), 0.75);
    border-radius: var(--border-radius-middle);
    color: white;
    font-size: 0.75em;
    font-weight: bold;
    overflow: hidden;
    padding: 0.25em 0.5em;
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    max-width: 100%;
    white-space: nowrap;
  }

  &__alt {
    color: rgb(var(--fg-color), 0.75);
    font-size: 0.875em;
    line-height: var(--line-height-high);
    margin-top: 0.5em;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

// 最古の引用元ポストトグル
.oldest-quoted-post-toggle {
  display: flex;
  justify-content: flex-end;

  & > button {
    font-size: 0.875em;
    margin: -0.5em -1em -0.5em 0;
  }
}

.repost {
  grid-area: r;
  background-color: rgba(var(--post-color), 0.125);
  border: 1px solid rgb(var(--post-color), 0.25);
  border-radius: var(--border-radius-middle);

  :not([data-position="slim"]) & > .post {
    padding: 0.75em;
  }
  [data-position="slim"] & > .post {
    padding: 0.5em;
  }

  &.textlabel {
    opacity: 0.75;
    padding: 0.75em;
  }
}

// フィードカード
// リストカード
// スターターパックカード
.feed-card,
.list-card,
.starter-pack-card {
  --card-color: var(--fg-color);
  background-color: rgb(var(--card-color), 0.125);
  border: 1px solid rgb(var(--card-color), 0.25);
  border-radius: var(--border-radius-middle);
}
.feed-card {
  --card-color: var(--feed-color);
}
.list-card {
  --card-color: var(--list-color);
}
.starter-pack-card {
  --card-color: var(--starter-pack-color);
}

// フィードカード
.feed-card {
  background-color: rgb(var(--accent-color), 0.125);
}

// ラベルタグ
.label-tags {
  --alpha: 0.75;
  font-size: 0.75em;
}

.reaction-container {
  grid-area: f;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr; // for Android
  align-items: center;
  &[data-has-lightning="true"] {
    grid-template-columns: 1fr 1fr 1fr 1fr auto; // for Android
  }
  &:not(:first-child) {
    margin-top: 0.25em;
  }

  & > div:last-child {
    display: flex;
    margin-left: auto;
  }

  .icon-button:deep() > span {
    white-space: nowrap;
  }

  // 非SPレイアウト
  @include media-not-sp-layout() {
    grid-gap: 0.5em;
  }

  // SPレイアウト
  @include media-sp-layout() {
    grid-gap: 0.375em;
  }
}

// リプライボタン
// ほぼ Threadgate 対応
.reply_count {
  &[data-has-threadgate="false"] {
    grid-template-columns: auto 1fr;
  }
  &[data-has-threadgate="true"] {
    grid-template-columns: auto auto 1fr;
  }

  & > .ignore {
    display: none;
  }

  & > .svg-icon--lock {
    fill: rgb(var(--fg-color), 0.25);
    margin-top: -0.25em;
  }

  & > .svg-icon--unlock {
    fill: rgb(var(--accent-color));
    margin-top: -0.25em;
  }
}
</style>
