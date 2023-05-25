<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"
import OPTIONS from "@/consts/options.json"

const emit = defineEmits<{(event: string): void}>()

const props = defineProps<{
  post?: TTPost
}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const state = reactive<{
  reason?: string
}>({
  reason: undefined,
})

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback,
  data: [
    {
      state,
      model: "reason",
      label: $t("selectReportReason"),
      type: "radio",
      required: true,
      options: OPTIONS.postReportReason,
      layout: "vertical",
    },
  ],
}

function close () {
  emit("close")
}

async function submitCallback () {
  Util.blurElement()
  if (mainState.processing) return
  mainState.processing = true
  const response = await mainState.atp.createReport(
    state.reason as string,
    props.post?.author?.did,
    props.post?.cid,
    props.post?.uri
  )
  mainState.processing = false
  if (response) {
    mainState.openMessagePopup($t("success"), $t("successMessage"))
    close()
  } else {
    mainState.openErrorPopup("errorApiFailed", "SendPostReportPopup/createReport")
  }
}
</script>

<template>
  <Popup
    class="send-post-report-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="alert" />
        <span>{{ $t("sendPostReport") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-post-report-popup {
  .popup-header > h2 {
    color: rgb(var(--notice-color));

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
