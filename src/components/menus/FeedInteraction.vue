<script lang="ts" setup>
import { inject, reactive } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  uri?: string
  feedGeneratorDid?: string
  feedContext?: string
  reqId?: string
}>()

const mainState = inject("state") as MainState

async function sendFeedInteraction (event: TTFeedInteraction["event"]) {
  Util.blurElement()
  if (
    props.uri == null ||
    props.feedGeneratorDid == null ||
    mainState.loaderDisplay
  ) {
    return
  }
  emit("close")
  mainState.loaderDisplay = true
  const response = await mainState.atp.createFeedInteractions([{
    item: props.uri,
    event,
    feedContext: props.feedContext ?? "",
    reqId: props.reqId ?? "",
  }], props.feedGeneratorDid)
  mainState.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "FeedInteraction/sendFeedInteraction")
    return
  }
}
</script>

<template>
  <div class="feed-interaction">
    <button
      :disabled="mainState.loaderDisplay"
      @click.stop="sendFeedInteraction('app.bsky.feed.defs#requestMore')"
    >
      <SVGIcon name="thumbUp" />
      <span>{{ $t("feedInteractionMore") }}</span>
    </button>
    <button
      :disabled="mainState.loaderDisplay"
      @click.stop="sendFeedInteraction('app.bsky.feed.defs#requestLess')"
    >
      <SVGIcon name="thumbDown" />
      <span>{{ $t("feedInteractionLess") }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.feed-interaction {
  display: contents;
}
</style>
