<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  handle: string
  viewer: TTUserViewer
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean;
}>({
  processing: false,
})

async function toggleMute () {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  try {
    if (props.viewer.muted) {
      await mainState.atp.disableMute(props.handle)
      props.viewer.muted = false

      mainState.currentMutingUsers = mainState.currentMutingUsers.filter((user: TTUser) => {
        return user.handle !== props.handle
      })
    } else {
      await mainState.atp.enableMute(props.handle)
      props.viewer.muted = true
    }
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <button
    class="button mute-button"
    :data-is-muting="viewer.muted"
    :data-is-processing="state.processing"
    @click.prevent="toggleMute"
  >
    <template v-if="viewer.muted">
      <SVGIcon name="volumeOff" />
      <span>{{ $t("muteOff") }}</span>
    </template>
    <template v-else>
      <SVGIcon name="volumeOn" />
      <span>{{ $t("muteOn") }}</span>
    </template>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.mute-button {
  position: relative;
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
  &[data-is-processing="true"] {
    pointer-events: none;
  }

  & > .loader {
    font-size: 0.5rem;
    position: absolute;
  }
}
</style>
