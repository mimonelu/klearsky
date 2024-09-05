<script lang="ts" setup>
import { inject, reactive } from "vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const props = defineProps<{
  did: string
  viewer: TTUserViewer
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
}>({
  processing: false,
})

async function toggleBlock () {
  Util.blurElement()
  if (state.processing) {
    return
  }
  state.processing = true
  if (props.viewer.blocking) {
    const response = await mainState.atp.updateBlockToDisable(props.viewer.blocking)
    state.processing = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "BlockButton/toggleBlock")
      return
    }
    delete props.viewer.blocking

    // ブロックユーザー一覧の更新
    mainState.currentBlockingUsers = mainState.currentBlockingUsers
      .filter((user: TTUser) => {
        return user.did !== props.did
      })
  } else {
    const response = await mainState.atp.updateBlockToEnable(props.did)
    state.processing = false
    if (response instanceof Error) {
      mainState.openErrorPopup(response, "BlockButton/toggleBlock")
      return
    }
    props.viewer.blocking = response
  }
}
</script>

<template>
  <button
    class="button--bordered--important block-button"
    :disabled="viewer.blockingByList != null"
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
