<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function reDraft () {
  Util.blurElement()
  emit("close")
  const params = await makeSendPostPopupPropsFromPost(props.post)
  if (params == null) {
    return
  }
  params.action = "reuse"
  await mainState.openSendPostPopup(params)
}

async function makeSendPostPopupPropsFromPost (src: TTPost): Promise<undefined | TTSendPostPopupParams> {
  const parentOrRootPost = await fetchParentOrRootPost(src)
  if (parentOrRootPost instanceof Error) {
    return
  }
  const { media: viewMedia, quote } = Util.resolveEmbed(src.embed)
  const quotePost = quote?.$type === "app.bsky.embed.record#viewRecord"
    ? Util.toPostLike(quote)
    : undefined
  const type = parentOrRootPost != null
    ? "reply"
    : quotePost != null
      ? "quoteRepost"
      : "post"
  const post = type === "reply"
    ? parentOrRootPost
    : quotePost
  const text = src.record?.text ?? ""
  const url =
    viewMedia?.$type === "app.bsky.embed.external#view"
      ? viewMedia.external.uri
      : (
        quote?.$type === "app.bsky.feed.defs#generatorView" ||
        quote?.$type === "app.bsky.graph.defs#listView" ||
        quote?.$type === "app.bsky.graph.defs#starterPackViewBasic"
      )
        ? quote.uri
        : undefined
  const langs = src.record?.langs
  const labels = src.labels
    ?.filter((label) => label.src === src.author.did)
    ?.map((label) => label.val)
  const rawMedia = Util.resolveEmbed(src.record.embed).media
  const medias = (
    rawMedia?.$type === "app.bsky.embed.images"
      ? rawMedia.images
      : rawMedia?.$type === "app.bsky.embed.gallery"
        ? rawMedia.items
        : rawMedia?.$type === "app.bsky.embed.video"
          ? [rawMedia]
          : undefined
  ) as undefined | Array<TTImage>

  // TODO: ポスト再利用機能の添付ファイル対応
  if (medias != null) {
    if (!(await mainState.openConfirmationPopup({
      title: $t("reDraft"),
      text: $t("reDraftCaution"),
    }))) {
      return
    }
  }

  const draftReactionControl = await fetchReactionControl(src)
  if (draftReactionControl instanceof Error) {
    return
  }
  return {
    type,
    post,
    text,
    url,
    langs,
    labels,

    // TODO: ポスト再利用機能の添付ファイル対応
    // medias,

    draftReactionControl,
  }
}

async function fetchParentOrRootPost (post: TTPost): Promise<undefined | Error | TTPost> {
  const replyUri =
    post.record.reply?.parent?.uri ??
    post.record.reply?.root?.uri
  if (replyUri == null) {
    return
  }
  mainState.loaderDisplay = true
  const response = await mainState.atp.fetchPosts([replyUri])
  mainState.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ReDraft/fetchParentOrRootPost")
    return response
  }
  return response[0]
}

async function fetchReactionControl (src: TTPost): Promise<Error | TTDraftReactionControl> {
  const rc: TTDraftReactionControl = {
    postgateAllow: true,
    threadgateAction: "none",
    allowMention: false,
    allowFollower: false,
    allowFollowing: false,
    listUris: [],
  }

  // Threadgate（ポストのレスポンスに含まれる）
  if (src.threadgate?.record?.allow != null) {
    rc.threadgateAction = "custom"
    for (const allow of src.threadgate.record.allow) {
      if (allow.$type.includes("mentionRule")) {
        rc.allowMention = true
      } else if (allow.$type.includes("followerRule")) {
        rc.allowFollower = true
      } else if (allow.$type.includes("followingRule")) {
        rc.allowFollowing = true
      } else if (allow.$type.includes("listRule") && allow.list != null) {
        rc.listUris.push(allow.list as unknown as string)
      }
    }
  }

  // Postgate（別途APIで取得が必要）
  mainState.loaderDisplay = true
  const postgate = await mainState.atp.fetchPostgate(src.uri)
  mainState.loaderDisplay = false
  if (postgate instanceof Error) {
    mainState.openErrorPopup(postgate, "ReDraft/fetchReactionControl")
    return postgate
  }
  if (postgate?.value != null) {
    const hasDisableRule = postgate.value.embeddingRules?.some((rule: any) => {
      return rule.$type === "app.bsky.feed.postgate#disableRule"
    })
    if (hasDisableRule) {
      rc.postgateAllow = false
    }
  }

  return rc
}
</script>

<template>
  <button @click.prevent.stop="reDraft">
    <SVGIcon name="edit" />
    <span>{{ $t("reDraft") }}</span>
  </button>
</template>
