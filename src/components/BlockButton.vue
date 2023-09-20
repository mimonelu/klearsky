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

async function toggleBlock () {
  Util.blurElement()
  if (state.processing) return
  state.processing = true
  try {
    if (props.viewer.blocking) {
      await mainState.atp.updateBlockToDisable(props.viewer.blocking)
      delete props.viewer.blocking

      // ブロックユーザー一覧の更新
      mainState.currentBlockingUsers = mainState.currentBlockingUsers.filter((user: TTUser) => {
        return user.did !== props.did
      })
    } else {
      const blocking = await mainState.atp.updateBlockToEnable(props.did)
      if (blocking != null) props.viewer.blocking = blocking
    }
  } finally {
    state.processing = false
  }
}
</script>

<template>
  <button
    class="button--bordered--important block-button"
    :data-enabled="viewer.blocking != null"
    :data-is-processing="state.processing"
    @click.prevent="toggleBlock"
  >
    <template v-if="viewer.blocking != null">
      <SVGIcon name="personOff" />
    </template>
    <template v-else>
      <SVGIcon name="person" />
    </template>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.block-button {
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
