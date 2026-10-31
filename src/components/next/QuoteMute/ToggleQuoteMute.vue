<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useQuoteMute } from "./use-quote-mute"

const emit = defineEmits<{(event: "close"): void}>()

const props = defineProps<{
  did: string
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const { isQuoteMuted, toggleQuoteMute } = useQuoteMute(() => props.did, mainState)

async function toggle() {
  Util.blurElement()
  emit("close")
  mainState.loaderDisplay = true
  const response = await toggleQuoteMute()
  mainState.loaderDisplay = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "ToggleQuoteMute/toggle")
  }
}
</script>

<template>
  <button @click.stop="toggle">
    <SVGIcon :name="isQuoteMuted ? 'quoteRepost' : 'quoteRepostOff'" />
    <span>{{ $t(isQuoteMuted ? "enableQuoteRepost" : "disableQuoteRepost") }}</span>
  </button>
</template>
