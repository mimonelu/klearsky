<script lang="ts" setup>
import { computed, inject, onMounted, onBeforeUnmount, reactive, ref, type ComputedRef } from "vue"
import { useRouter } from "vue-router"
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
import RepostButton from "@/components/buttons/RepostButton.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Thumbnail from "@/components/images/Thumbnail.vue"
import Util from "@/composables/util"

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
  forceHideImages?: boolean
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  text: ComputedRef<undefined | string>
  isTextOnlyEmoji: ComputedRef<boolean>

  // 画像
  images: ComputedRef<Array<TTImage>>
  hasImage: ComputedRef<boolean>
  displayImage: ComputedRef<boolean>
  foldingImage: boolean

  // リンクカード
  linkCard: ComputedRef<undefined | TTExternal>
  hasLinkCard: ComputedRef<boolean>

  // フィードカード
  hasFeedCard: ComputedRef<boolean>

  // リストカード
  hasListCard: ComputedRef<boolean>

  // 最古の引用元ポストかどうか
  isOldestQuotedPost: ComputedRef<boolean>

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
  isTextOnlyEmoji: computed((): boolean => {
    return state.text?.match(/^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}){1,3}$/u) != null
  }),

  // 画像
  images: computed(() => props.post.embed?.images ?? props.post.record?.embed?.images ?? []),
  hasImage: computed((): boolean => state.images.length > 0),

  // 画像の折り畳み
  // TODO: 引用リポストに対応すること
  displayImage: computed((): boolean => {
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

  // TODO: displayImage 共々 post に内包するべき
  foldingImage: false,

  // リンクカード
  linkCard: computed(() => props.post.embed?.external ?? props.post.record?.embed?.external),
  hasLinkCard: computed((): boolean => state.linkCard != null && props.position !== 'slim'),

  // フィードカード
  hasFeedCard: computed((): boolean => props.post.embed?.record?.$type === "app.bsky.feed.defs#generatorView"),

  // リストカード
  hasListCard: computed((): boolean => props.post.embed?.record?.$type === "app.bsky.graph.defs#listView"),

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
    return mainState.myLabeler.getSpecificLabels(state.allLabels, ["hide"], ["none", "content", "media"])
  }),
  hideLabelNames: computed((): Array<string> => {
    return state.hideLabels.map((label) => {
      return $t(label.locale?.name || label.definition?.identifier || "")
    })
  }),
  blurContentLabels: computed((): Array<TILabelSetting> => {
    return mainState.myLabeler.getSpecificLabels(state.allLabels, ["hide", "warn"], ["none", "content"])
  }),
  blurMediaLabels: computed((): Array<TILabelSetting> => {
    return mainState.myLabeler.getSpecificLabels(state.allLabels, ["hide", "warn"], ["media"])
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
    if (threadgate == null) {
      return "none"
    }
    return props.post.viewer?.replyDisabled ? "lock" : "unlock"
  }),

  // ワードミュートの判定
  isWordMute: computed((): boolean => {
    const target = state.text?.toLowerCase() ?? ""
    if (!target) {
      return false
    }
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

async function onOpenRepostPopover ($event: Event) {
  Util.blurElement()
  mainState.repostPopoverProps.post = props.post
  mainState.repostPopoverCallback = repostPopoverCallback
  mainState.openRepostPopover($event.target)
}

async function repostPopoverCallback (type: "createRepost" | "deleteRepost" | "createQuoteRepost") {
  switch (type) {
    case "createRepost": {
      await createRepost()
      break
    }
    case "deleteRepost": {
      await deleteRepost()
      break
    }
    case "createQuoteRepost": {
      await createQuoteRepost()
      break
    }
  }
}

async function createRepost () {
  state.processing = true
  try {
    const result = await mainState.atp.createRepost(
      props.post.uri,
      props.post.cid
    )
    if (result) {
      await updatePostThread()
    }
  } finally {
    state.processing = false
  }
}

async function deleteRepost () {
  if (props.post.viewer?.repost == null) {
    return
  }
  state.processing = true
  try {
    await mainState.atp.deleteRepost(props.post.viewer.repost)
    await updatePostThread()
  } finally {
    state.processing = false
  }
}

async function createQuoteRepost () {
  const done = await mainState.openSendPostPopup({ type: "quoteRepost", post: props.post })
  state.processing = true
  try {
    if (done) {
      await updatePostThread()
    }
  } finally {
    state.processing = false
  }
}

async function onActivateLikeButton () {
  if (state.processing) {
    return
  }
  Util.blurElement()
  state.processing = true
  try {
    if (props.post.viewer?.like != null) {
      await mainState.atp.deleteLike(props.post.viewer.like as string)
    } else {
      await mainState.atp.createLike(props.post.uri, props.post.cid)
    }
    await updatePostThread()
  } finally {
    state.processing = false
  }
}

function openPostPopover ($event: Event) {
  Util.blurElement()
  mainState.postPopoverProps.post = props.post
  mainState.postPopoverCallback = postPopoverCallback
  mainState.openPostPopover($event.target)
}

async function postPopoverCallback (type: "deletePost" | "updatePost") {
  switch (type) {
    case "deletePost": {
      await deletePost(props.post.uri)
      break
    }
    case "updatePost": {
      await updatePost()
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

async function deletePost (uri: string) {
  if (state.processing) {
    return
  }
  state.processing = true
  try {
    await mainState.atp.deletePost(uri)
  } finally {
    state.processing = false
    emit("removeThisPost", uri)
  }
}

async function updatePost () {
  state.processing = true
  if (mainState.currentPath.startsWith("/post")) {
    await mainState.fetchPostThread()
  } else {
    await updatePostThread()
  }
  state.processing = false
}

async function updatePostThread () {
  // レコード更新直後に最新レコードを取得できない現象対策
  // TODO: 原因不明に付き暫定対応、後日再検証すること
  await Util.wait(375)

  const posts: undefined | false | Array<TTPost> = await mainState.atp.fetchPosts([props.post.uri])
  if (!posts || posts.length === 0) {
    return
  }
  emit("updateThisPostThread", posts)
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

// 自動翻訳
async function translateText (forceTranslate: boolean) {
  if (props.post.__custom.translatedText != null) {
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
  props.post.__custom.translatedText = response
}

// マイリストの削除
async function deleteList (list: TTList) {
  if (!mainState.myLists.remove(list.uri)) {
    return
  }

  // セッションキャッシュの更新
  mainState.myWorker.setSessionCache("myList", mainState.myLists.items)

  delete props.post.embed?.record
}

function onActivateHashTag (text: string) {
  emit("onActivateHashTag", text)
}

// 最古の引用元ポストをトグル
function toggleOldestQuotedPostDisplay () {
  Util.blurElement()
  props.post.__custom.oldestQuotedPostDisplay = !props.post.__custom.oldestQuotedPostDisplay
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
    :data-is-masked="!post.__custom.unmask && state.masked"
    @click.prevent.stop="onActivatePost(post, $event)"
  >
    <slot name="post-before" />

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
      <SVGIcon :name="post.__custom.unmask
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
      v-if="post.__custom.unmask || !state.masked"
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
            class="avatar-in-post"
            :did="post.author?.did"
            :image="post.author?.avatar"
            :isLabeler="post.author?.associated?.labeler"
            :noLink="position === 'chatMessage'"
            @click.stop="$emit('click', $event)"
          />

          <!-- 表示名 -->
          <DisplayName
            class="body__right__header__display-name"
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
                v-if="mainState.myLabeler.isSubscribed(post.author?.did)"
                name="labeler"
                class="account-labeler-icon"
              />
              <SVGIcon
                v-else
                name="labelerOff"
                class="account-labeler-icon"
              />
            </template>
          </DisplayName>

          <!-- ハンドル -->
          <AuthorHandle
            v-if="position !== 'chatMessage'"
            :handle="post.author?.handle"
            :anonymizable="true"
          />

          <!-- ポスト時間 -->
          <div
            v-if="post.indexedAt"
            class="indexed-at"
          >{{ mainState.formatDate(post.indexedAt) }}</div>

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
              :text="state.text"
              :facets="post.record?.facets ?? post.value?.facets"
              :entities="post.record?.entities ?? post.value?.entities"
              :processHashTag="false"
              :hasTranslateLink="state.hasOtherLanguages"
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
                  <div
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
                        :hasTranslateLink="state.hasOtherLanguages"
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
              :displayImage="!forceHideImages"
              :noLink="false"
              :noEmbedded="forceHideImages === true"
            />

            <!-- フィードカード -->
            <FeedCard
              v-if="state.hasFeedCard"
              :generator="post.embed?.record as unknown as TTFeedGenerator"
              :menuDisplay="true"
              :detailDisplay="true"
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
              :detailDisplay="true"
              :orderButtonDisplay="false"
              @click.prevent.stop
              @deleteList="deleteList"
              @onActivateMention="$emit('click', $event)"
              @onActivateHashTag="$emit('click', $event)"
            />
          </template>

          <!-- ポストタグ -->
          <div
            v-if="
              post.record?.tags != null &&
              position !== 'slim'
            "
            class="post-tag-container"
          >
            <RouterLink
              v-for="postTag of post.record.tags"
              :to="`/search/post?text=${encodeURIComponent(postTag)}`"
              class="post-tag"
              @click.stop
            >
              <SVGIcon name="tag" />
              <span>{{ postTag }}</span>
            </RouterLink>
          </div>
        </div>

        <!-- ラベルタグ -->
        <LabelTags
          v-if="position !== 'slim'"
          :labels="state.allLabels"
          :harmfulDisplay="false"
          :customDisplay="false"
        />

        <!-- 引用リポスト／リストカード -->
        <template v-if="post.embed?.record != null">
          <!-- 引用リポスト／リストカード - 見つからない -->
          <div
            v-if="post.embed.record.$type === 'app.bsky.embed.record#viewNotFound'"
            class="textlabel repost"
          >
            <div class="textlabel__text">
              <SVGIcon name="alert" />{{ $t("postNotFound") }}
            </div>
          </div>

          <!-- 引用リポスト／リストカード - ブロック中／被ブロック中 -->
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
            <!-- 最古の引用元ポストトグル -->
            <div
              v-if="state.isOldestQuotedPost"
              class="oldest-quoted-post-toggle"
            >
              <button
                class="button--plane"
                @click.prevent.stop="toggleOldestQuotedPostDisplay"
              >
                <template v-if="post.__custom.oldestQuotedPostDisplay">
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
                post.__custom.oldestQuotedPostDisplay
              )
            "
              class="repost"
            >
              <Post
                :level="(level ?? 1) + 1"
                :position="position === 'chatMessage'
                  ? 'chatMessage'
                  : position === 'slim'
                    ? 'slim'
                    : 'postInPost'
                "
                :post="post.embed.record as TTPost"
                :hasReplyIcon="post.embed.record.value?.reply != null"
                :noLink="noLink"
                @click="$emit('click', $event)"
              />
            </div>
          </template>
        </template>

        <!-- リアクションコンテナ -->
        <div
          v-if="position !== 'chatMessage' && position !== 'postInPost' && position !== 'slim'"
          class="reaction-container"
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
            <!-- リポストポップオーバートリガー -->
            <RepostButton
              :post="post"
              @click.stop="onOpenRepostPopover"
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

            <!-- ポストポップオーバートリガー -->
            <button
              class="icon-button--nolabel menu-button"
              @click.stop="openPostPopover"
            >
              <div class="icon-container">
                <SVGIcon name="menu" />
              </div>
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
  padding: 0.75em;
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
    .list-card,
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
      fill: var(--fg-color-05);
    }

    & > span {
      color: var(--fg-color-05);
      font-size: 0.875em;
    }

    & > .author-handle {
      color: var(--fg-color-025);
    }
  }

  & > .svg-icon {
    font-size: 0.875em;
  }

  &__display-name {
    font-size: 0.875em;
  }
  &[disabled="true"] > &__display-name {
    color: var(--fg-color-05);
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

      .author-handle {
        --fg-color-05: var(--fg-color-075);
      }
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
  &:not([disabled="true"]) {
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
  grid-template-columns: auto 1fr auto;
  grid-gap: 0.5em;
  overflow: hidden;

  &__display-name {
    color: var(--fg-color-075);
    display: flex;
    align-items: center;
    grid-gap: 0.5em;
    font-size: 0.875em;

    // ラベラーアイコン
    .account-labeler-icon {
      fill: rgb(var(--share-color));
    }
  }
}

.post[data-position="chatMessage"] {
  .body__right__header {
    grid-template-columns: auto 1fr auto;
  }
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

.indexed-at {
  color: var(--fg-color-05);
  font-size: 0.75em;
  overflow: hidden;
  white-space: nowrap;
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
    font-size: 3em;
    line-height: 1;
  }
}

.translated-text {
  border-top: 1px solid var(--fg-color-0125);
  padding-top: 0.5em;
  color: var(--fg-color-075);
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

.quad-images {
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
  border: 1px solid var(--fg-color-025);
  border-radius: var(--border-radius-middle);
  &:focus, &:hover {
    border-color: var(--fg-color-0375);
  }

  :not([data-position="slim"]) & > .post {
    padding: 0.75em;
  }
  [data-position="slim"] & > .post {
    padding: 0.5em;
  }

  &.textlabel {
    opacity: 0.5;
    padding: 0.75em 0.75em 0.5em;
  }
}

// フィードカード
// リストカード
.feed-card,
.list-card {
  border: 1px solid var(--accent-color-025);
  border-radius: var(--border-radius-middle);
  &:focus, &:hover {
    border-color: var(--accent-color-05);
  }
}

// フィードカード
.feed-card {
  background-color: var(--accent-color-0125);
}

// ポストタグ
.post-tag-container {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.25em;
  &:empty {
    display: contents;
  }

  .post-tag {
    font-size: 0.75em;
    &:focus, &:hover {
      --alpha: 1.0;
      --fg-color: var(--accent-color);
    }
  }
}

// ラベルタグ
.label-tags {
  --alpha: 0.75;
  font-size: 0.75em;
}

.reaction-container {
  grid-area: f;
  display: grid;
  grid-gap: 0.5em;
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
    fill: var(--fg-color-05);
    margin-top: -0.25em;
  }

  & > .svg-icon--unlock {
    fill: rgb(var(--accent-color));
    margin-top: -0.25em;
  }
}

.lightning-link {
  margin-right: 0.75em;
}

.menu-button {
  margin: -0.75em -0.75em;
  padding: 0.75em 1.5em;
  position: relative;
}
</style>
