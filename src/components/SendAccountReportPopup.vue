<script lang="ts" setup>
import { inject, reactive } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import Util from "@/composables/util"
import OPTIONS from "@/consts/options.json"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  user?: TTUser
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
      options: OPTIONS.accountReportReason,
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
  try {
    console.log(state.reason)
    close()
  } finally {
    mainState.processing = false
  }
}
</script>

<template>
  <Popup
    class="send-account-report-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="alert" />
        <span>{{ $t("sendAccountReport") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-account-report-popup {
  .popup-header > h2 {
    color: rgb(var(--notice-color));

    & > .svg-icon {
      fill: rgb(var(--notice-color));
    }
  }
}
</style>
