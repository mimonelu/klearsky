<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  quotedUri: string
  quoterUri: string
  detached: boolean
}>()

const mainState = inject("state") as MainState

async function toggle () {
  Util.blurElement()
  emit("close")

  mainState.loaderDisplay = true
  // NOTICE: Postgate レコードが存在しない場合はエラーを表示しない
  const responseOfFetchPostgate = await mainState.atp.fetchPostgate(props.quotedUri)
  const postgate = responseOfFetchPostgate instanceof Error
    ? undefined
    : responseOfFetchPostgate.value
  mainState.loaderDisplay = false

  const allow = postgate?.embeddingRules?.every((rule) => {
    return rule.$type !== "app.bsky.feed.postgate#disableRule"
  }) ?? true

  const detachedEmbeddingUris = postgate?.detachedEmbeddingUris ?? []
  const index = detachedEmbeddingUris.findIndex((uri) => {
    return uri === props.quoterUri
  })
  if (index === - 1) {
    detachedEmbeddingUris.push(props.quoterUri)
  } else {
    detachedEmbeddingUris.splice(index, 1)
  }

  const responseOfUpdatePostgate = await mainState.atp.updatePostgate(
    props.quotedUri,
    allow,
    detachedEmbeddingUris
  )
  if (responseOfUpdatePostgate instanceof Error) {
    mainState.openErrorPopup(responseOfUpdatePostgate, "ToggleQuoteAttachment/toggle")
    return
  }

  mainState.postPopoverCallback?.("updatePost")
}
</script>

<template>
  <button
    class="toggle-quote-attachment"
    :data-detached="detached"
    @click.prevent.stop="toggle"
  >
    <SVGIcon name="quoteRepost" />
    <span>{{ $t(detached ? "attachQuote" : "detachQuote") }}</span>
  </button>
</template>

<style lang="scss" scoped>
.toggle-quote-attachment {
  &[data-detached="false"] {
    .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
