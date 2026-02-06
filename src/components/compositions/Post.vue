<script lang="ts">
// デカ絵文字
const EMOJI_ONLY_REGEX = /^(?:(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})[\uFE0E\uFE0F]?\p{Emoji_Modifier}?(?:\u200D(?:\p{Emoji_Presentation}|\p{Extended_Pictographic})[\uFE0E\uFE0F]?\p{Emoji_Modifier}?)*){1,7}$/u
</script>

<script lang="ts" setup>
/* eslint-disable vue/no-mutating-props */
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, type Ref } from "vue"
import { RouterLink, useRouter } from "vue-router"
import { RichText } from "@atproto/api"
import { differenceInDays } from "date-fns"
import AuthorHandle from "@/components/labels/AuthorHandle.vue"
import AvatarLink from "@/components/next/Avatar/AvatarLink.vue"
import ContentFilteringToggle from "@/components/buttons/ContentFilteringToggle.vue"
import DisplayName from "@/components/labels/DisplayName.vue"
import FeedCard from "@/components/cards/FeedCard.vue"
import HtmlText from "@/components/labels/HtmlText.vue"
import LabelTags from "@/components/buttons/LabelTags.vue"
import LikeButton from "@/components/buttons/LikeButton.vue"
import LinkCard from "@/components/cards/LinkCard.vue"
import ListCard from "@/components/cards/ListCard.vue"
import Loader from "@/components/shells/Loader.vue"
import OfficialBookmarkButton from "@/components/next/OfficialBookmark/OfficialBookmarkButton.vue"
import Post from "@/components/compositions/Post.vue"
import QuoteRepostButton from "@/components/buttons/QuoteRepostButton.vue"
import RepostButton from "@/components/buttons/RepostButton.vue"
import StarterPackCard from "@/components/cards/StarterPackCard.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Thumbnail from "@/components/images/Thumbnail.vue"
import TranslatedText from "@/components/labels/TranslatedText.vue"
import VerifierIcon from "@/components/next/Verification/VerifierIcon.vue"
import VerifiedIcon from "@/components/next/Verification/VerifiedIcon.vue"
import VideoPlayer from "@/components/images/VideoPlayer.vue"
import WordMuteScript from "@/components/next/WordMute/script"
import Util from "@/composables/util"
import { useContentLabels, hasUserBlurLabel } from "@/composables/util/use-content-labels"
import CONSTS from "@/consts/consts.json"
import OWN_DOMAIN from "@/consts/own-domain"

type TTQuotePostType = undefined | "NotFound" | "Detached" | "Blocked" | "Record"

const emit = defineEmits<{(event: string, params?: any): void}>()

const props = defineProps<{
  level?: number
  position: "post" | "root" | "parent" | "postInPost" | "preview" | "slim" | "chatMessage"
  post: TTPost
  rootPost?: TTPost
  parentPost?: TTPost
  focusPostUri?: string
  grandparentAuthor?: TTProfile
  hasOldPostNotification?: boolean
  hasReplyIcon?: boolean
  hasQuoteRepostIcon?: boolean
  noLink?: boolean
  noLabelTags?: boolean
  forceHideMedia?: boolean
  forceHideQuoteRepost?: boolean
  forceUpdatePostThread?: boolean

  // フィードインタラクション
  feedAcceptsInteractions?: boolean
  feedGeneratorDid?: string
  feedContext?: string
  reqId?: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  // メディア
  videoType?: string

  // 翻訳ステータス
  translationStep: TTTranslationStep

  // ラベル
  blurContentClicked: boolean
  blurMediaClicked: boolean
}>({
  // メディア
  videoType: undefined,

  // 翻訳ステータス
  translationStep: "none",

  // ラベル
  blurContentClicked: false,
  blurMediaClicked: false,
})

const router = useRouter()

const postElement = ref()

const processing = ref(false)

// 本文
const text = ref(props.post.record?.text)

// 投稿日時
const indexedAt =
  props.post.record?.createdAt ??
  props.post.indexedAt ??
  ""

// デカ絵文字
const isTextOnlyEmoji =
  (text.value?.length ?? 0) <= 80 &&
  EMOJI_ONLY_REGEX.test(text.value ?? "")

// embed
const embed =
  props.post.embed ??
  props.post.record?.embed

const embedRecord = embed?.record

// リンクカード
const linkCard: undefined | Readonly<TTExternal> = embed?.external ?? embed?.media?.external

// リンクカードの存在
const hasLinkCard = linkCard != null

// フィードカードの存在
const hasFeedCard = embedRecord?.$type === "app.bsky.feed.defs#generatorView"

// リストカードの存在
const hasListCard = embedRecord?.$type === "app.bsky.graph.defs#listView"

// スターターパックカードの存在
const hasStarterPack = embedRecord?.record?.$type === "app.bsky.graph.starterpack"

// メディア - 画像
const embedImages: readonly TTImage[] =
  embed?.images ??
  (embed?.media as any)?.images ??
  props.post.record?.embed?.images ?? // 3階層目の画像
  []

// メディア - 動画
const embedVideo: undefined | Readonly<TIVideo>  =
  embed?.$type?.startsWith("app.bsky.embed.video")
    ? embed as unknown as TIVideo
    : embed?.media?.$type?.startsWith("app.bsky.embed.video")
      ? embed.media as unknown as TIVideo
      : undefined

// メディア - 画像または動画を持つかどうか
const hasMedia = embedImages.length > 0 || embedVideo != null

// メディア - 動画のアスペクト比
// `imageMaxHeightRatio` を参照しているため computed
const embedVideoAspectRatio = computed((): string => {
  if (
    embedVideo?.aspectRatio == null ||
    embedVideo.aspectRatio.width == null ||
    embedVideo.aspectRatio.height == null
  ) {
    return "unset"
  }
  const aspectHeight =
    embedVideo.aspectRatio.height /
    embedVideo.aspectRatio.width
  if (!mainState.currentSetting.imageMaxHeightRatio) {
    return `1 / ${aspectHeight}`
  }
  const computedHeight = Math.min(
    aspectHeight,
    mainState.currentSetting.imageMaxHeightRatio
  )
  return `1 / ${computedHeight}`
})

// メディア - メディア表示判定
const shouldDisplayMedia = computed(() => {
  const setting = mainState.currentSetting.imageFolding

  // なし - すべて表示
  if (setting === "none") {
    return true
  }

  // 適度 - 自身とフォロイーとフォロイーのリポスト、およびプロフィールユーザーのみ表示
  if (setting === "recommended") {
    return (
      props.post.author?.did === mainState.atp.session?.did ||
      props.post.author?.viewer?.following != null ||
      props.post.__custom?.reason?.by.viewer?.following != null ||
      (
        mainState.currentPath.startsWith("/profile/") &&
        props.post.author?.did === mainState.currentProfile?.did
      )
    )
  }

  // すべて - 自身以外
  if (setting === "all") {
    return props.post.author?.did === mainState.atp.session?.did
  }

  return false
})

// メディア - メディアの折り畳み状態
const foldingMedia = ref(!shouldDisplayMedia.value)

// 引用リポストの種類
const quotePostType: Ref<TTQuotePostType> = ref(updateQuotePostType())

function updateQuotePostType (): TTQuotePostType {
  const embed =
    props.post.embed ??
    props.post.record?.embed
  if (
    embed?.record?.$type === "app.bsky.embed.record#viewRecord" ||
    embed?.record?.record?.$type === "app.bsky.embed.record#viewRecord"
  ) {
    return "Record"
  }
  if (
    embed?.record?.$type === "app.bsky.embed.record#viewNotFound" ||
    embed?.record?.record?.$type === "app.bsky.embed.record#viewNotFound"
  ) {
    return "NotFound"
  }
  if (
    embed?.record?.$type === "app.bsky.embed.record#viewDetached" ||
    embed?.record?.record?.$type === "app.bsky.embed.record#viewDetached"
  ) {
    return "Detached"
  }
  if (
    embed?.record?.$type === "app.bsky.embed.record#viewBlocked" ||
    embed?.record?.record?.$type === "app.bsky.embed.record#viewBlocked"
  ) {
    return "Blocked"
  }
  return undefined
}

// 引用リポストのURI
const quotePostUri = embedRecord?.uri ?? embedRecord?.record?.uri as undefined | string

// 最古の引用元ポストかどうか
const isOldestQuotedPost = (props.level ?? 1) >= 3 - 1

// ポストマスクの表示状態
const masked = computed((): boolean => {
  return (
    noContentLanguage.value ||
    hasHideLabel.value ||
    isWordMute.value ||
    isRepostMute.value
  ) && (
    props.position !== "preview" &&
    props.position !== "slim"
  )
})

// 対象ポスト言語
const postLanguages: undefined | ReadonlyArray<string> =
  props.post.record?.langs ??
  props.post.value?.langs

// 翻訳リンクの設置可否 - 共通用
const hasOtherLanguages = computed((): boolean => {
  if (!postLanguages?.length) {
    return false
  }
  const userLanguage = Util.getUserLanguage() ?? "en"
  return postLanguages.every((language) => {
    return language !== userLanguage
  })
})

// 翻訳リンクの設置可否 - 本文用
const hasOtherLanguagesForText = computed((): boolean => {
  if (props.noLink) {
    return false
  }
  if (!text.value) {
    return false
  }
  return hasOtherLanguages.value
})

// コンテンツ言語の判定
const noContentLanguage = computed((): boolean => {
  // コンテンツ言語設定はポストスレッドとプロフィールポストでは無効
  if (mainState.currentPath === "/post" ||
      mainState.currentPath.startsWith("/profile/")
  ) {
    return false
  }

  if (!(mainState.currentSetting.contentLanguages?.length)) {
    return false
  }
  if (!(postLanguages?.length)) {
    return false
  }
  return !(postLanguages?.some((language: any) => {
    return mainState.currentSetting.contentLanguages?.includes(language) ?? false
  }) ?? false)
})

// ラベル
const {
  allLabels,
  hideLabels,
  blurContentLabels,
  blurMediaLabels,
  hasHideLabel,
  hasBlurContentLabel,
  hasBlurMediaLabel
} = useContentLabels(
  computed(() => props.post.author?.labels),
  computed(() => props.post.labels)
)

// ラベル - ポストマスクに表示する文字列
const hideLabelNames = computed((): Array<string> => {
  return hideLabels.value.map((label) => {
    return label.locale?.name || label.definition?.identifier || ""
  })
})

// ラベル - ポストコンテンツ
const postContentDisplay = computed((): boolean => {
  return !hasBlurContentLabel.value ||
    (
      hasBlurContentLabel.value &&
      state.blurContentClicked
    )
})

// ラベル - ポストメディア
const hasBlurMedia = computed((): boolean => {
  return (hasMedia || hasLinkCard || hasFeedCard) && hasBlurMediaLabel.value
})
const postMediaDisplay = computed((): boolean => {
  return !hasBlurMedia.value ||
    (
      hasBlurMedia.value &&
      state.blurMediaClicked
    )
})

// ラベル - アバターぼかし（ユーザーのラベルで判断）
const hasBlurAvatarLabel = computed((): boolean => {
  return hasUserBlurLabel(mainState, props.post.author?.labels)
})

// Threadgate
const threadgate = computed((): "none" | "lock" | "unlock" => {
  const threadgate = props.post.threadgate as any
  if (threadgate == null) {
    return "none"
  }
  return props.post.viewer?.replyDisabled ? "lock" : "unlock"
})

// ワードミュート - ワードミュートの判定
const isWordMute = computed((): boolean => {
  return WordMuteScript.includes(
    contentRichText.value,
    mainState.currentSetting.wordMute,
    props.post.author?.viewer?.following != null
  )
})

// リポストミュート - リポストミュートの判定
const isRepostMute = computed((): boolean => {
  if (props.post.__custom?.reason?.$type !== "app.bsky.feed.defs#reasonRepost") {
    return false
  }
  const repostByDid = props.post.__custom?.reason?.by?.did
  if (repostByDid == null) {
    return false
  }
  return mainState.repostMutes.some((subject) => subject.did === repostByDid)
})

// ワードミュート - 本文とワードミュート用に RichText を生成
const contentRichText = computed(() => {
  // テキストまたはfacetsが変更された場合のみ再生成
  const currentText = text.value ?? ""
  const facets = props.post.record?.facets ?? props.post.value?.facets
  const richText = new RichText({
    text: currentText,
    facets,
  }, {
    cleanNewlines: true,
  })
  if (facets == null) {
    richText.detectFacetsWithoutResolution()
  }
  return richText
})

// 自動翻訳
const observer = mainState.currentSetting.autoTranslation
  ? new IntersectionObserver((items) => {
    items.forEach((item) => {
      if (!item.isIntersecting) {
        return
      }
      const cid = item.target.getAttribute("data-cid")
      if (cid !== props.post.cid || state.translationStep !== "none") {
        return
      }
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
  if (observer != null && postElement.value != null) {
    observer.unobserve(postElement.value)
  }
  observer?.disconnect()
})

function isFocused (): boolean {
  const rkey = Util.getRkey(props.post.uri)
  return (
    props.post.uri === props.focusPostUri ||
    rkey === mainState.currentQuery.rkey
  )
}

// 古いポスト警告
const displayOldPostNotification = props.hasOldPostNotification && indexedAt != null
  ? differenceInDays(new Date(), new Date(indexedAt)) >= CONSTS.OLD_POST_NOTIFICATION_DAYS
  : false

async function onActivatePost (post: TTPost, event: Event) {
  // ポストマスクの無効化
  if (!props.post.__custom?.unmask && masked.value) {
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
  foldingMedia.value = !foldingMedia.value
}

function onActivatePostContentToggle () {
  state.blurContentClicked = !state.blurContentClicked
}

function onActivatePostMediaToggle () {
  state.blurMediaClicked = !state.blurMediaClicked
}

async function onActivateReplyButton () {
  Util.blurElement()
  const done = await mainState.openSendPostPopup({ type: "reply", post: props.post })
  processing.value = true
  if (done) {
    if (mainState.currentPath.startsWith("/post")) {
      await mainState.fetchPostThread()
    } else {
      await updatePostThread()
    }
  }
  processing.value = false
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

  // リポスト経由リポスト／いいね対応
  const via = makeActionViaRepost("repost")

  processing.value = true
  const response = await mainState.atp.createRepost(
    props.post.uri,
    props.post.cid,
    via
  )
  if (response instanceof Error) {
    processing.value = false
    mainState.openErrorPopup(response, "Post/createRepost")
    return
  }
  await updatePostThread()
  processing.value = false
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
  processing.value = true
  const response = await mainState.atp.deleteRepost(props.post.viewer.repost)
  if (response instanceof Error) {
    processing.value = false
    mainState.openErrorPopup(response, "Post/deleteRepost")
    return
  }
  await updatePostThread()
  processing.value = false
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

async function toggleOfficialBookmark () {
  Util.blurElement()
  processing.value = true
  if (props.post.viewer?.bookmarked) {
    const response = await mainState.atp.deleteOfficialBookmark(props.post.uri)
    if (response instanceof Error) {
      processing.value = false
      mainState.openErrorPopup(response, "Post/deleteOfficialBookmark")
      return
    }
  } else {
    const response = await mainState.atp.createOfficialBookmark(props.post.uri, props.post.cid)
    if (response instanceof Error) {
      processing.value = false
      mainState.openErrorPopup(response, "Post/createOfficialBookmark")
      return
    }
  }
  await updatePostThread()
  processing.value = false
}

async function onActivateLikeButton () {
  if (processing.value) {
    return
  }
  Util.blurElement()
  processing.value = true

  // リポスト経由リポスト／いいね対応
  const via = makeActionViaRepost("like")

  const response = props.post.viewer?.like != null
    ? await mainState.atp.deleteLike(props.post.viewer.like as string)
    : await mainState.atp.createLike(props.post.uri, props.post.cid, via)
  if (response instanceof Error) {
    processing.value = false
    mainState.openErrorPopup(response, "Post/onActivateLikeButton")
    return
  }
  /*
  if (props.post.viewer != null) {
    if (props.post.viewer.like != null) {
      props.post.viewer.like = undefined
      props.post.likeCount --
    } else {
      props.post.viewer.like = response
      props.post.likeCount ++
    }
  }
  */
  await updatePostThread()
  processing.value = false
}

function makeActionViaRepost (actionType: "like" | "repost"): undefined | TTCidUri {
  const disabled = (mainState.currentSetting.disableActionViaRepost?.findIndex((action: string) => {
    return action === actionType
  }) ?? - 1) === - 1
  return (
    disabled &&
    props.post.__custom?.reason?.cid != null &&
    props.post.__custom?.reason?.uri != null
  )
    ? {
      cid: props.post.__custom.reason.cid,
      uri: props.post.__custom.reason.uri,
    }
    : undefined
}

function openPostPopover ($event: Event) {
  Util.blurElement()
  mainState.postPopoverProps.post = props.post

  // フィードインタラクション
  mainState.postPopoverProps.feedAcceptsInteractions = props.feedAcceptsInteractions
  mainState.postPopoverProps.feedGeneratorDid = props.feedGeneratorDid
  mainState.postPopoverProps.feedContext = props.feedContext
  mainState.postPopoverProps.reqId = props.reqId

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
  processing.value = true
  await translateText(true)
  processing.value = false
}

function onTranslateVideoAlt () {
  if (embedVideo?.alt != null) {
    Util.translateInExternalService(embedVideo.alt)
  }
}

async function deletePost (uri: string) {
  if (processing.value) {
    return
  }
  processing.value = true
  const response = await mainState.atp.deletePost(uri)
  processing.value = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "Post/deletePost")
    return
  }
  emit("removeThisPost", uri)
}

async function updatePost () {
  processing.value = true
  if (mainState.currentPath.startsWith("/post")) {
    await mainState.fetchPostThread()

    // 引用リポスト一覧からの Postgate 操作用
    if (props.forceUpdatePostThread) {
      await updatePostThread()
    }
  } else {
    await updatePostThread()
  }
  processing.value = false
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

  // ポスト編集後に内容を更新する
  // このために text を ref にしている
  text.value = props.post.record?.text

  quotePostType.value = updateQuotePostType()
}

async function createCustomBookmark (uri: string, cid: string) {
  if (processing.value) {
    return
  }
  processing.value = true
  const tags = ["demo"]
  const response = await mainState.atp.updateCustomBookmarks(uri, cid, tags)
  processing.value = false
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
  if (processing.value) {
    return
  }
  processing.value = true
  const response = await mainState.atp.deleteCustomBookmark(uri)
  processing.value = false
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
  if (
    embedImages[imageIndex].fullsize == null &&
    embedImages[imageIndex].image == null
  ) {
    return
  }
  mainState.imagePopupProps.did = props.post.author?.did
  mainState.imagePopupProps.images = embedImages.map((image: TTImage) => {
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
  mainState.imagePopupProps.alts = embedImages.map((image: TTImage) => image.alt)
  mainState.imagePopupProps.index = imageIndex
  mainState.imagePopupProps.display = true
}

function updateVideoType (videoType: string) {
  state.videoType = videoType
}

// 自動翻訳
async function translateText (forceTranslate: boolean) {
  if (props.post.__custom?.translatedText != null) {
    state.translationStep = "done"
    return
  }
  if (
    state.translationStep === "ignore" ||
    state.translationStep === "waiting"
  ) {
    return
  }
  state.translationStep = "waiting"
  const response = await Util.translateText(
    text.value,
    postLanguages,
    mainState.currentSetting.autoTranslationIgnoreLanguage,
    mainState.atp.session?.email,
    forceTranslate
  )
  if (response == null) {
    state.translationStep = "ignore"
    return
  }
  if (response instanceof Error) {
    state.translationStep = "failed"
    return
  }
  state.translationStep = "done"
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

/* eslint-enable vue/no-mutating-props */
</script>

<template>
  <div
    class="post"
    ref="postElement"
    :data-cid="post.cid"
    :data-position="position"
    :data-repost="post.__custom?.reason != null"
    :data-focus="isFocused()"
    :data-has-mask="masked"
    :data-has-grandparent-author="grandparentAuthor != null"
    :data-is-masked="!(post.__custom?.unmask) && masked"
    @click.prevent.stop="onActivatePost(post, $event)"
  >
    <slot name="post-before" />

    <!-- 古いポスト警告 -->
    <div
      v-if="displayOldPostNotification"
      class="old-post-notification textlabel"
    >
      <div class="textlabel__text--warning">
        <SVGIcon name="clock" />{{ $t("oldPostNotification") }}
      </div>
    </div>

    <!-- ポストヘッダー -->
    <div
      v-if="position !== 'preview'"
      class="header"
      @click.stop
    >
      <slot name="header-before" />

      <!-- ポストヘッダー - 引用リポストのリプライアイコン -->
      <div
        v-if="hasReplyIcon"
        class="reply-icon"
      >
        <SVGIcon name="reply" />
        <span>{{ $t("reply") }}</span>
      </div>

      <!-- ポストヘッダー - 引用リポストの引用リポストアイコン -->
      <div
        v-if="hasQuoteRepostIcon"
        class="quote-repost-icon"
      >
        <SVGIcon name="quoteRepost" />
        <span>{{ $t("quoteRepost") }}</span>
      </div>

      <!-- ポストヘッダー - リプライ先ユーザー -->
      <template v-if="parentPost != null">
        <!-- ポストヘッダー - リプライ先ユーザー - リプライ先ポストは存在しない -->
        <div
          v-if="parentPost.notFound"
          class="replier"
          disabled="true"
        >
          <SVGIcon name="reply" />
          <span>{{ $t("replyUnknown") }}</span>
        </div>

        <!-- ポストヘッダー - リプライ先ユーザー - リプライ先ポストは存在する -->
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

      <!-- ポストヘッダー - リプライ先のリプライ先 -->
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

      <!-- ポストヘッダー - リポストユーザー -->
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
      v-if="masked"
      class="post__mask"
      @click.stop="onActivatePostMask"
    >
      <SVGIcon :name="post.__custom?.unmask
        ? 'cursorUp'
        : 'cursorDown'
      " />

      <!-- ポストマスク - コンテンツ言語なし -->
      <SVGIcon
        v-show="noContentLanguage"
        name="translate"
      />

      <!-- ポストマスク - アカウントラベル＆ポストラベル -->
      <template v-if="hideLabelNames.length > 0">
        <SVGIcon name="contentFiltering" />
        <div class="post__mask__content-warning">{{ hideLabelNames.join(", ") }}</div>
      </template>

      <!-- ポストマスク - ワードミュート -->
      <SVGIcon
        v-show="isWordMute"
        name="wordMute"
      />

      <!-- ポストマスク - リポストミュート -->
      <SVGIcon
        v-show="isRepostMute"
        name="repostOff"
      />

      <DisplayName
        class="post__mask__display-name"
        :displayName="post.author?.displayName"
        :anonymizable="true"
      />
      <div class="post__mask__handle">{{
        !mainState.currentSetting.postAnonymization
          ? post.author?.handle
          : ""
      }}</div>
    </button>

    <!-- ポストボディ -->
    <div
      v-if="post.__custom?.unmask || !masked"
      class="body"
    >
      <slot name="body-before" />

      <!-- ポストボディ - ヘッダー -->
      <div class="body__header">
        <!-- アバターリンク -->
        <div class="body__header__avatar">
          <AvatarLink
            :did="post.author?.did"
            :image="post.author?.avatar"
            :blur="hasBlurAvatarLabel"
            :isLabeler="post.author?.associated?.labeler"
            :actorStatus="post.author?.status"
            :noLink="position === 'chatMessage'"
            @click.stop="$emit('click', $event)"
          />
        </div>

        <!-- 表示名 -->
        <div class="body__header__display-name">
          <!-- 認証者アイコン -->
          <VerifierIcon
            :did="post.author?.did"
            :displayName="post.author?.displayName"
            :verification="post.author?.verification"
          />

          <!-- 認証済みアイコン -->
          <VerifiedIcon
            :did="post.author?.did"
            :displayName="post.author?.displayName"
            :verification="post.author?.verification"
          />

          <!-- ラベラーアイコン -->
          <SVGIcon
            v-if="post.author?.associated?.labeler"
            :name="mainState.myLabeler?.isSubscribed(post.author?.did) ? 'labeler' : 'labelerOff'"
            class="account-labeler-icon"
          />

          <RouterLink
            :to="{ name: 'profile-feeds', query: { account: post.author?.did } }"
            @click.stop
          >
            <DisplayName
              :displayName="(
                position === 'chatMessage'
                  ? (post.author?.displayName || post.author?.handle)
                  : post.author?.displayName
              ) || '&nbsp;'"
              :pronouns="post.author?.pronouns"
              :anonymizable="true"
            />
          </RouterLink>
        </div>

        <div class="body__header__detail">
          <!-- ハンドル -->
          <AuthorHandle
            class="body__header__author-handle"
            :handle="post.author?.handle"
            :anonymizable="true"
          />

          <SVGIcon
            class="body__header__point"
            name="point"
          />

          <!-- ポスト時間 -->
          <div
            v-if="indexedAt"
            class="body__header__indexed-at"
            translate="no"
          >{{ mainState.formatDate(indexedAt) }}</div>
        </div>

        <!-- ポストポップオーバートリガー -->
        <button
          v-if="
            position !== 'chatMessage' &&
            position !== 'postInPost' &&
            position !== 'preview' &&
            position !== 'slim'
          "
          class="icon-button--nolabel body__header__menu-button"
          @click.stop="openPostPopover"
        >
          <div class="icon-container">
            <SVGIcon name="menu" />
          </div>
        </button>

        <slot name="header-after" />
      </div>

      <!-- ポストボディ - ポストコンテンツトグル -->
      <div
        v-if="hasBlurContentLabel"
        class="post__content-filtering-toggle"
      >
        <ContentFilteringToggle
          type="blur"
          :labels="blurContentLabels"
          :display="state.blurContentClicked"
          :togglable="true"
          @click.prevent.stop="onActivatePostContentToggle"
        />
      </div>

      <!-- ポストボディ - ポストコンテンツ -->
      <div
        v-if="postContentDisplay"
        class="post__content"
      >
        <!-- 本文 -->
        <template v-if="text !== ''">
          <HtmlText
            v-if="position !== 'slim'"
            class="text"
            dir="auto"
            :richText="contentRichText"
            :hasTranslateLink="hasOtherLanguagesForText"
            :data-is-text-only-emoji="isTextOnlyEmoji"
            @onActivateHashTag="(tag) => onActivateHashTag(tag as string)"
            @translate="onForceTranslate"
          />
          <div
            v-else
            class="text--slim"
            dir="auto"
          >{{ text }}</div>
        </template>

        <!-- 自動翻訳 -->
        <TranslatedText
          :step="state.translationStep"
          :text="props.post.__custom?.translatedText"
        />

        <!-- ポストメディアトグル -->
        <ContentFilteringToggle
          v-if="hasBlurMedia"
          type="blur-media"
          :labels="blurMediaLabels"
          :display="state.blurMediaClicked"
          :togglable="true"
          @click.prevent.stop="onActivatePostMediaToggle"
        />

        <!-- ポストメディア -->
        <template v-if="postMediaDisplay">
          <!-- 画像 -->
          <template v-if="hasMedia">
            <template v-if="forceHideMedia">
              <div class="omit-images">
                <SVGIcon
                  v-for="_, index of embedImages"
                  :key="index"
                  name="image"
                />
              </div>
            </template>
            <template v-else-if="position !== 'slim'">
              <!-- メディアフォルダーボタン -->
              <button
                v-if="!shouldDisplayMedia"
                class="button--bordered image-folder-button"
                @click.prevent.stop="onActivateImageFolderButton"
              >
                <template v-if="foldingMedia">
                  <SVGIcon name="image" />
                  <span>{{ $t("showImage") }}</span>
                </template>
                <template v-else>
                  <SVGIcon name="offImage" />
                  <span>{{ $t("hideImage") }}</span>
                </template>
              </button>

              <!-- メディアボックス -->
              <template v-if="shouldDisplayMedia || (!shouldDisplayMedia && !foldingMedia)">
                <!-- 画像 -->
                <div
                  v-if="embedImages.length > 0"
                  class="quad-images"
                  :data-number-of-images="embedImages.length"
                >
                  <div
                    v-for="image, imageIndex of embedImages"
                    :key="imageIndex"
                    class="quad-image"
                  >
                    <Thumbnail
                      :image="image"
                      :did="post.author?.did"
                      :hasTranslateLink="hasOtherLanguages"
                      @click.stop="openImagePopup(imageIndex)"
                    />
                  </div>
                </div>

                <!-- 動画 -->
                <div
                  v-if="embedVideo != null"
                  class="video-container"
                >
                  <VideoPlayer
                    :playlist="embedVideo.playlist"
                    :did="post.author?.did"
                    :cid="embedVideo.cid ?? embedVideo.video?.ref?.toString()"
                    :poster="embedVideo.thumbnail"
                    :preload="mainState.currentSetting.videoPreload"
                    :style="{ 'aspect-ratio': embedVideoAspectRatio }"
                    @updateVideoType="(videoType) => updateVideoType(videoType as string)"
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
                    v-if="embedVideo.alt"
                    class="video-container__alt"
                    dir="auto"
                    :text="embedVideo.alt"
                    :hasTranslateLink="hasOtherLanguagesForText"
                    @onActivateHashTag="(tag) => onActivateHashTag(tag as string)"
                    @translate="onTranslateVideoAlt"
                  />
                </div>
              </template>
            </template>
            <template v-else>
              <!-- イメージリスト（通知ポップアップ） -->
              <div
                v-if="embedImages.length > 0"
                class="image-list"
              >
                <Thumbnail
                  v-for="image, imageIndex of embedImages"
                  :key="imageIndex"
                  :image="image"
                  :did="post.author?.did"
                  @click.stop="openImagePopup(imageIndex)"
                />
              </div>
            </template>
          </template>

          <!-- リンクカード -->
          <LinkCard
            v-if="hasLinkCard && position !== 'slim'"
            :external="linkCard as TTExternal"
            :layout="mainState.currentSetting.linkcardLayout ?? 'vertical'"
            :displayImage="!forceHideMedia"
            :noLink="false"
            :noEmbedded="forceHideMedia === true"
          />

          <!-- フィードカード -->
          <FeedCard
            v-if="hasFeedCard"
            :generator="embedRecord as unknown as TTFeedGenerator"
            :menuDisplay="true"
            :detailDisplay="false"
            :orderButtonDisplay="false"
            :creatorDisplay="true"
            @click.prevent.stop
            @onActivateMention="$emit('click', $event)"
            @onActivateHashTag="$emit('click', $event)"
          />

          <!-- リストカード -->
          <ListCard
            v-if="hasListCard"
            :list="embedRecord as unknown as TTList"
            :menuDisplay="true"
            :detailDisplay="false"
            :orderButtonDisplay="false"
            @click.prevent.stop
            @deleteList="(list) => deleteList(list as TTList)"
            @onActivateMention="$emit('click', $event)"
            @onActivateHashTag="$emit('click', $event)"
          />

          <!-- スターターパックカード -->
          <StarterPackCard
            v-if="hasStarterPack"
            :starterPack="embedRecord as unknown as TIStarterPack"
            :menuDisplay="true"
            :detailDisplay="false"
            :creatorDisplay="true"
            :unclickable="false"
            @onActivateMention="$emit('click', $event)"
            @onActivateHashTag="$emit('click', $event)"
          />
        </template>
      </div>

      <!-- ポストボディ - ラベルタグ -->
      <LabelTags
        v-if="!noLabelTags && position !== 'preview' && position !== 'slim'"
        :labels="allLabels"
        :labelerDisplay="false"
        :unauthenticatedDisplay="false"
        :harmfulDisplay="true"
        :customDisplay="false"
        :userCreatedAt="post.author?.createdAt"
        :postIndexedAt="post.indexedAt"
        :bridgyOriginalUrl="(post.record as any)?.bridgyOriginalUrl"
      />

      <!-- ポストボディ - 引用リポスト - 見つからない -->
      <div
        v-if="quotePostType === 'NotFound'"
        class="textlabel repost"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("postNotFound") }}
        </div>
      </div>

      <!-- ポストボディ - 引用リポスト - 切断時 -->
      <template v-else-if="quotePostType === 'Detached' && !forceHideQuoteRepost">
        <!-- ポストボディ - 引用リポスト - 切断時 - 自身のポスト -->
        <RouterLink
          v-if="quotePostUri?.startsWith(`at://${mainState.atp.session?.did}/`)"
          :to="{ name: 'post', query: { uri: quotePostUri } }"
          class="textlabel repost"
          @click.prevent.stop
        >
          <div class="textlabel__text--alert">
            <SVGIcon name="alert" />{{ $t("postDetachedBySelf") }}
          </div>
        </RouterLink>

        <!-- ポストボディ - 引用リポスト - 切断時 - 他ユーザーのポスト -->
        <div
          v-else
          class="textlabel repost"
        >
          <div class="textlabel__text">
            <SVGIcon name="alert" />{{ $t("postDetachedByOther") }}
          </div>
        </div>
      </template>

      <!-- ポストボディ - 引用リポスト - ブロック中／被ブロック中 -->
      <div
        v-else-if="quotePostType === 'Blocked'"
        class="textlabel repost"
      >
        <div class="textlabel__text">
          <SVGIcon name="alert" />{{ $t("postBlocked") }}
        </div>
      </div>

      <!-- ポストボディ - 引用リポスト -->
      <template v-else-if="quotePostType === 'Record' && !forceHideQuoteRepost">
        <!-- 最古の引用元ポストトグル -->
        <div
          v-if="isOldestQuotedPost"
          class="oldest-quoted-post-toggle"
        >
          <button
            class="button--plain"
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
          embedRecord != null &&
          (
            !isOldestQuotedPost ||
            (
              isOldestQuotedPost &&
              post.__custom?.oldestQuotedPostDisplay
            )
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
            :post="embedRecord as TTPost"
            :hasReplyIcon="embedRecord?.record?.reply != null"
            :noLink="position === 'chatMessage' ? false : noLink"
            @click="$emit('click', $event)"
          />
        </div>
      </template>

      <!-- ポストボディ - リアクションコンテナ -->
      <div
        v-if="
          position !== 'chatMessage' &&
          position !== 'postInPost' &&
          position !== 'slim'
        "
        class="reaction-container"
        :data-has-lightning="!!post.record?.[OWN_DOMAIN.OWN_DOMAIN_LIGHTNING]"
      >
        <div>
          <!-- リプライボタン -->
          <button
            class="icon-button reply_count"
            :disabled="threadgate === 'lock'"
            :data-has-threadgate="threadgate !== 'none'"
            @click.stop="onActivateReplyButton"
          >
            <!-- Threadgate -->
            <SVGIcon
              v-if="threadgate === 'lock'"
              name="lock"
            />
            <SVGIcon
              v-else-if="threadgate === 'unlock'"
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
          <!-- 公式ブックマークボタン -->
          <OfficialBookmarkButton
            :post="post"
            @click.stop="toggleOfficialBookmark"
          />
        </div>
        <div
          v-if="post.record?.[OWN_DOMAIN.OWN_DOMAIN_LIGHTNING]"
          class="lightning-link"
        >
          <!-- Lightning -->
          <a
            class="icon-button--nolabel"
            :href="`lightning:${post.record?.[OWN_DOMAIN.OWN_DOMAIN_LIGHTNING]}`"
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
    <Loader v-if="processing" />
  </div>
</template>

<style lang="scss" scoped>
.post {
  --post-padding: 0.75em;
  --left-space: 0;
  --avatar-size: 3em;

  display: flex;
  flex-direction: column;
  padding: var(--post-padding);
  position: relative;

  @include media-sp-layout() {
    --avatar-size: 2.125em;
  }

  // 引用ポスト
  &[data-position="postInPost"] {
    --avatar-size: 2em;
    font-size: 0.9375em;
  }

  // チャットポスト
  &[data-position="chatMessage"] {
    --avatar-size: 2em;
  }

  // プレビューポスト
  &[data-position="preview"] {
    --avatar-size: 2em;
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

  // スリムポスト
  &[data-position="slim"] {
    --avatar-size: 2em;
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
      margin: calc(var(--post-padding) * -1) calc(var(--post-padding) * -1) 0;
      padding: var(--post-padding);
    }
  }
  &__mask {
    --alpha: 0.5;
    cursor: pointer;
    display: grid;
    grid-template-columns: repeat(6, auto) 1fr;
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
    & > .svg-icon--repostOff,
    & > .svg-icon--wordMute {
      fill: rgb(var(--notice-color), var(--alpha));
    }

    &__content-warning,
    &__handle {
      line-height: var(--line-height-low);
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

  // 左側のスペース
  &[data-has-child="true"],
  &[data-has-child="false"] {
    --left-space: calc(var(--avatar-size) + 0.5em);
  }
  @include media-not-sp-layout() {
    &:not([data-position="chatMessage"]):not([data-position="postInPost"]):not([data-position="preview"]):not([data-position="slim"]) {
      --left-space: calc(var(--avatar-size) + 0.5em);
    }
  }

  // リプライライン
  &[data-has-child="true"],
  &[data-has-child="false"] {
    --top: var(--post-padding);
    --gap: var(--post-padding);
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
      left: calc(var(--post-padding) + var(--avatar-size) / 2 - 1.5px);
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

// 古いポスト警告
.old-post-notification {
  margin-bottom: 0.5em;
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
  margin: calc(var(--post-padding) * -1) calc(var(--post-padding) * -1) -0.5em;
  padding: var(--post-padding);
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
  grid-template-columns: 1fr;
  grid-gap: 0.5em;
  align-items: flex-start;
  position: relative;
}

.body__header {
  display: grid;
  align-items: center;
  grid-gap: 0.125em 0.5em;
  grid-template-areas:
    "a d m"
    "a h m";
  grid-template-columns: auto 1fr auto;

  &__avatar {
    grid-area: a;
    position: relative;
    width: var(--avatar-size);
    height: 2em;
    z-index: 1;

    & > .avatar-link {
      font-size: var(--avatar-size);
      position: absolute;

      // 縦中央
      // margin-top: -0.5em;
      // top: 50%;
    }
  }

  // 表示名
  &__display-name {
    grid-area: d;
    display: flex;
    align-items: center;
    grid-gap: 0.25em;
    overflow: hidden;

    & > a {
      display: inline-block;
    }

    .display-name {
      color: rgb(var(--fg-color), 0.75);
      display: grid;
      grid-template-columns: auto 1fr;
      font-size: 0.875em;
      &:focus, &:hover {
        color: rgb(var(--fg-color));
      }
    }
  }

  // ラベラーアイコン
  .account-labeler-icon {
    fill: rgb(var(--label-color));
    font-size: 0.875em;
  }

  // 認証者アイコン
  .verifier-icon {
    font-size: 0.875em;
  }

  // 認証済みアイコン
  .verified-icon {
    font-size: 0.875em;
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
    line-height: var(--line-height-low);
    overflow: hidden;
    white-space: nowrap;
  }

  &__menu-button {
    grid-area: m;
    margin: -0.5em -0.75em -0.5em 0;
    padding: 1em;
    position: relative;
  }
}

// ポストコンテンツトグル
.post__content-filtering-toggle {
  display: grid;
  margin-left: var(--left-space);
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
  padding-left: var(--left-space);
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

  // SPレイアウト時に画像と動画を横幅いっぱいまで広げる
  @include media-sp-layout() {
    .post[data-position="post"]:not([data-has-child]) > .body > .post__content > & {
      grid-gap: 1px;
      margin-left: calc(var(--post-padding) * -1);
      margin-right: calc(var(--post-padding) * -1);
      width: calc(100% + var(--post-padding) * 2);

      .thumbnail,
      .video-player {
        border: unset;
        border-radius: unset;
      }

      & > .html-text {
        margin-left: var(--post-padding);
        margin-right: var(--post-padding);
      }
    }
  }
}

.image-list {
  display: flex;
  grid-gap: 0.5rem;

  .thumbnail:deep() {
    & > .lazy-image {
      height: 4rem;
    }

    & > .alt-button {
      font-size: 0.625em;
      white-space: nowrap;
    }

    & > .loader {
      font-size: 0.5rem;
    }
  }
}

.video-container {
  position: relative;

  .video-player {
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
  background-color: rgba(var(--post-color), 0.125);
  border: 1px solid rgb(var(--post-color), 0.25);
  border-radius: var(--border-radius-middle);
  margin-left: var(--left-space);

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
  padding-left: var(--left-space);

  &:deep() > * {
    font-size: 0.75em;
  }
}

.reaction-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr; // for Android
  align-items: center;
  padding-left: var(--left-space);
  &[data-has-lightning="true"] {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto; // for Android
  }
  &:not(:first-child) {
    margin-top: 0.25em;
  }

  .lightning-link {
    display: flex;
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
