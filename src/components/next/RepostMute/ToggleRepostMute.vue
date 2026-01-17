<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useRepostMute } from "./use-repost-mute"

const emit = defineEmits<{(event: "close"): void}>()

const props = defineProps<{
  did: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const { isRepostMuted, toggleRepostMute } = useRepostMute(() => props.did, mainState)

async function toggle() {
  Util.blurElement()
  emit("close")
  mainState.loaderDisplay = true
  const response = await toggleRepostMute()
  mainState.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ToggleRepostMute/toggle")
  }
}
</script>

<template>
  <button @click.stop="toggle">
    <SVGIcon :name="isRepostMuted ? 'repost' : 'repostOff'" />
    <span>{{ $t(isRepostMuted ? "enableRepost" : "disableRepost") }}</span>
  </button>
</template>
