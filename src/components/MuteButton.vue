<script lang="ts" setup>
import { inject } from "vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util/index"

const props = defineProps<{
  handle: string
  viewer: TTUserViewer
}>()

const mainState = inject("state") as MainState

async function toggleMute () {
  Util.blurElement()
  mainState.processing = true
  try {
    if (props.viewer.muted) {
      await mainState.atp.disableMute(props.handle)
      props.viewer.muted = false
    } else {
      await mainState.atp.enableMute(props.handle)
      props.viewer.muted = true
    }
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <button
    class="button mute-button"
    :data-is-muting="viewer.muted"
    @click.prevent="toggleMute"
  >
    <template v-if="viewer.muted">
      <SVGIcon name="volumeOff" />
      <span>{{ $t("muting") }}</span>
    </template>
    <template v-else>
      <SVGIcon name="volumeOn" />
      <span>{{ $t("mute") }}</span>
    </template>
  </button>
</template>

<style lang="scss" scoped>
.mute-button {
  &[data-is-muting="true"] {
    background-color: rgba(var(--notice-color), 0.875);
    &:focus, &:hover {
      background-color: rgb(var(--notice-color));
    }
  }
  &[data-is-muting="false"] {
    background-color: transparent;
    border-color: rgba(var(--notice-color), 0.875);
    color: rgba(var(--notice-color), 0.875);
    .svg-icon {
      fill: rgba(var(--notice-color), 0.875);
    }
    &:focus, &:hover {
      border-color: rgb(var(--notice-color));
      color: rgb(var(--notice-color));
      .svg-icon {
        fill: rgb(var(--notice-color));
      }
    }
  }
}
</style>
