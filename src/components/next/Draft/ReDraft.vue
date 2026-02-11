<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post: TTPost
}>()

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
  return {
    type,
    post,
    text,
    url,
    langs,
    labels,
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
</script>

<template>
  <button @click.prevent.stop="reDraft">
    <SVGIcon name="edit" />
    <span>{{ $t("reDraft") }}</span>
  </button>
</template>
