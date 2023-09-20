<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/Loader.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  did: string
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
      await mainState.atp.updateMuteToDisable(props.did)
      props.viewer.muted = false

      // ミュートユーザー一覧の更新
      mainState.currentMutingUsers = mainState.currentMutingUsers.filter((user: TTUser) => {
        return user.viewer.blocking !== props.viewer.blocking
      })
    } else {
      await mainState.atp.updateMuteToEnable(props.did)
      props.viewer.muted = true
    }
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <button
    class="button--bordered--important mute-button"
    :data-enabled="viewer.muted"
    :data-is-processing="state.processing"
    @click.prevent="toggleMute"
  >
    <template v-if="viewer.muted">
      <SVGIcon name="volumeOff" />
    </template>
    <template v-else>
      <SVGIcon name="volumeOn" />
    </template>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.mute-button {
  position: relative;
  &[data-is-processing="true"] {
    pointer-events: none;
  }

  & > .loader {
    font-size: 0.5rem;
    position: absolute;
  }
}
</style>
