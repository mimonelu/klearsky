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
  const type = parentOrRootPost != null
    ? "reply"
    : src.embed?.record?.$type === "app.bsky.embed.record#viewRecord"
      ? "quoteRepost"
      : "post"
  const post = type === "reply"
    ? parentOrRootPost
    : type === "quoteRepost"
      ? src.embed?.record
      : undefined
  const text = src.record?.text ?? ""
  const url =
    src.embed?.external?.uri ??
    src.embed?.media?.external?.uri ??
    (
      (
        src.embed?.record?.$type === "app.bsky.feed.defs#generatorView" ||
        src.embed?.record?.$type === "app.bsky.graph.defs#listView" ||
        src.embed?.record?.record?.$type === "app.bsky.graph.starterpack"
      )
        ? src.embed?.record?.uri
        : undefined
    )
  const langs = src.record?.langs
  const labels = src.labels
    ?.filter((label) => label.src === src.author.did)
    ?.map((label) => label.val)
  const medias = (
    src.record.embed?.images ??
    src.record.embed?.media?.images ??
    (
      src.record.embed?.$type === "app.bsky.embed.video"
        ? [src.record.embed]
        : undefined
    ) ??
    (
      src.record.embed?.media?.$type === "app.bsky.embed.video"
        ? [src.record.embed.media]
        : undefined
    )
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

async function fetchReactionControl (src: TTPost): Promise<TTDraftReactionControl> {
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
    // Postgate レコードが存在しない場合はエラーを表示しない
    // mainState.openErrorPopup(postgate, "ReDraft/fetchReactionControl")
    // return postgate
    return rc
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
