<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import { useRepostMute } from "./use-repost-mute"

const props = defineProps<{
  did: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

const { isRepostMuted, toggleRepostMute } = useRepostMute(() => props.did, mainState)

async function toggle() {
  Util.blurElement()
  if (state.processing) {
    return
  }
  state.processing = true
  const response = await toggleRepostMute()
  state.processing = false
  if (response instanceof Error) {
    mainState.openErrorPopup(response, "RepostMuteButton/toggle")
  }
}
</script>

<template>
  <button
    class="button--bordered button--nolabel repost-mute-button"
    :data-enabled="isRepostMuted"
    :data-is-processing="state.processing"
    @click.prevent="toggle"
  >
    <SVGIcon name="repostOff" />
    <span>&#160;</span>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.repost-mute-button {
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
