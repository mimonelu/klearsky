<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const mainState = inject("state") as MainState

const state = reactive<{
  processing: boolean
  isLabelerSubscribing: ComputedRef<boolean>
  isLabelerOfficial: ComputedRef<boolean>
}>({
  processing: false,
  isLabelerSubscribing: computed((): boolean => {
    if (mainState.currentProfile == null) {
      return false
    }
    return mainState.myLabeler.indexOfMyLabelerPrefferences(mainState.currentProfile.did) !== - 1
  }),
  isLabelerOfficial: computed((): boolean => {
    return mainState.currentProfile?.did === CONSTS.OFFICIAL_LABELER_DID
  }),
})

async function toggleLabelerSubscribe () {
  Util.blurElement()
  if (state.processing) {
    return
  }
  if (mainState.currentProfile == null) {
    return
  }
  if (state.isLabelerOfficial) {
    return
  }
  if (state.isLabelerSubscribing) {
    mainState.myLabeler.unsubscribe(mainState.currentProfile.did)
  } else {
    mainState.myLabeler.subscribe(mainState.currentProfile.did)
  }

  // プリファレンスの保存
  state.processing = true
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  state.processing = false
  if (!result) {
    mainState.openErrorPopup("errorApiFailed", "ProfileView/updatePreferences")
  }

  // ラベラーのHTTPヘッダーを設定
  mainState.myLabeler.setAtprotoAcceptLabelers()

  // セッションキャッシュの更新
  if (result) {
    mainState.myWorker.setSessionCache("currentPreferences", mainState.currentPreferences)
  }
}
</script>

<template>
  <button
    class="subscribe-labeler-toggle"
    :class="state.isLabelerSubscribing ? 'button' : 'button--bordered'"
    :disabled="state.isLabelerOfficial"
    @click.stop="toggleLabelerSubscribe"
  >
    <SVGIcon name="labeler" />
    <span>{{ $t(state.isLabelerSubscribing ? "unsubscribeLabel" : "subscribeLabel") }}</span>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.subscribe-labeler-toggle {
  --fg-color: var(--share-color);
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
