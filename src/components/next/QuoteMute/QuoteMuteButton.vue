<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useQuoteMute } from "./use-quote-mute"

const props = defineProps<{
  did: string
  hasLabel?: boolean
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

const { isQuoteMuted, toggleQuoteMute } = useQuoteMute(() => props.did, mainState)

async function toggle() {
  Util.blurElement()
  if (state.processing) {
    return
  }
  state.processing = true
  const response = await toggleQuoteMute()
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "QuoteMuteButton/toggle")
  }
}
</script>

<template>
  <button
    class="button--bordered quote-mute-button"
    :class="hasLabel ? '' : 'button--nolabel'"
    :data-enabled="isQuoteMuted"
    :data-is-processing="state.processing"
    @click.prevent="toggle"
  >
    <SVGIcon name="quoteRepostOff" />
    <span>{{ hasLabel ? $t(isQuoteMuted ? "enableQuoteRepost" : "disableQuoteRepost") : "&#160;" }}</span>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.quote-mute-button {
  background-color: rgb(var(--bg-color));
  position: relative;
  &[data-is-processing="true"] {
    pointer-events: none;
  }
  &[data-enabled="true"] {
    --bg-color: var(--notice-color);
    --fg-color: var(--white-color);
  }

  & > .loader {
    font-size: 0.5rem;
    position: absolute;
  }
}
</style>
