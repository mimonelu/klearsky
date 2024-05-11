<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Loader from "@/components/common/Loader.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"

const mainState = inject("state") as MainState

const props = defineProps<{
  labeler?: TILabeler
}>()

const state = reactive<{
  processing: boolean
  isLabelerSubscribing: ComputedRef<boolean>
  isLabelerOfficial: ComputedRef<boolean>
}>({
  processing: false,
  isLabelerSubscribing: computed((): boolean => {
    if (props.labeler == null) {
      return false
    }
    const myLabelerDids = mainState.myLabeler.makeMyLabelerPrefferenceDids()
    return myLabelerDids.indexOf(props.labeler.creator.did) !== - 1
  }),
  isLabelerOfficial: computed((): boolean => {
    return props.labeler?.creator.did === CONSTS.OFFICIAL_LABELER_DID
  }),
})

async function toggleLabelerSubscribe () {
  Util.blurElement()
  if (state.processing ||
      props.labeler == null ||
      state.isLabelerOfficial
  ) {
    return
  }
  if (state.isLabelerSubscribing) {
    mainState.myLabeler.unsubscribe(props.labeler.creator.did)
  } else {
    mainState.myLabeler.subscribe(props.labeler.creator.did, props.labeler)
  }

  // ラベラーのHTTPヘッダーを設定
  mainState.myLabeler.setAtprotoAcceptLabelers()

  // プリファレンスの保存
  state.processing = true
  const result = await mainState.atp.updatePreferences(mainState.currentPreferences)
  state.processing = false
  if (!result) {
    mainState.openErrorPopup("errorApiFailed", "ProfileView/updatePreferences")
  }

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
    :disabled="labeler == null || state.isLabelerOfficial"
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
