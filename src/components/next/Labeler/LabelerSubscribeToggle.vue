<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Loader from "@/components/shells/Loader.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const $t = inject("$t") as Function

const props = defineProps<{
  labeler?: TILabeler
}>()

const state = reactive<{
  processing: boolean

  // 登録済みラベラーかどうか
  isLabelerSubscribing: ComputedRef<boolean>

  // 公式ラベラーかどうか
  isLabelerOfficial: ComputedRef<boolean>
}>({
  processing: false,

  // 登録済みラベラーかどうか
  isLabelerSubscribing: computed((): boolean => {
    return mainState.myLabeler!.isSubscribed(props.labeler?.creator.did)
  }),

  // 公式ラベラーかどうか
  isLabelerOfficial: computed((): boolean => {
    return mainState.myLabeler!.isOfficial(props.labeler?.creator.did)
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
    // ラベラーの解除
    if (!mainState.myLabeler!.unsubscribe(props.labeler.creator.did)) {
      return
    }
    emit("unsubscribed")
  } else {
    // ラベラーの上限値チェック
    if (!mainState.myLabeler!.belowMyLabelerLimit()) {
      mainState.openMessagePopup({
        title: $t("error"),
        text: $t("labelerOverLimit"),
      })
      return
    }

    // ラベラーの登録
    if (!mainState.myLabeler!.subscribe(props.labeler.creator.did, props.labeler)) {
      return
    }

    emit("subscribed")
  }

  // プリファレンスの保存
  state.processing = true
  const result = await mainState.updatePreferences()
  state.processing = false
  if (!result) {
    return
  }

  // セッションキャッシュの更新
  mainState.myWorker!.setSessionCache("currentPreferences", mainState.currentPreferences)
  mainState.myWorker!.setSessionCache("myLabeler", mainState.myLabeler!.labelers)
}
</script>

<template>
  <button
    class="labeler-subscribe-toggle"
    :class="state.isLabelerSubscribing ? 'button' : 'button--bordered'"
    :disabled="labeler == null || state.isLabelerOfficial"
    @click.stop="toggleLabelerSubscribe"
  >
    <SVGIcon :name="state.isLabelerSubscribing ? 'labeler' : 'labelerOff'" />
    <span>{{ $t(state.isLabelerSubscribing ? "unsubscribeLabel" : "subscribeLabel") }}</span>
    <Loader v-if="state.processing" />
  </button>
</template>

<style lang="scss" scoped>
.labeler-subscribe-toggle {
  --fg-color: var(--label-color);
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
