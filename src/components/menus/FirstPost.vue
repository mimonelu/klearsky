<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  did: string
}>()

const mainState = inject("state") as MainState

async function openFirstPost () {
  Util.blurElement()
  emit("close")
  if (props.did == null) return
  if (mainState.centerLoaderDisplay) return
  mainState.centerLoaderDisplay = true
  const post = await mainState.atp.fetchFirstPost(props.did)
  mainState.centerLoaderDisplay = false
  if (post instanceof Error) {
    mainState.openErrorPopup(post.message, "FirstPost/openFirstPost")
    return
  }
  if (post == null) return
  mainState.openTimeFeedsPopup(post, "new")
}
</script>

<template>
  <button @click.prevent.stop="openFirstPost">
    <SVGIcon name="post" />
    <span>{{ $t("firstPost") }}</span>
  </button>
</template>
