<script lang="ts" setup>
import { inject } from "vue"
import EasyForm from "@/components/form-parts/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  submitButtonLabel: $t("apply"),
  submitCallback: close,
  blurOnSubmit: true,
  data: [
    {
      state: mainState.currentSetting,
      model: "globallineLayout",
      label: $t("globallineLayout"),
      type: "radio",
      required: true,
      options: [
        { label: "globallineLayoutPost", value: "post" },
        { label: "globallineLayoutSlim", value: "slim" },
      ],
      layout: "horizontal",
      onUpdate: saveSetting,
    },
  ],
}

function close () {
  emit("close")
}

function saveSetting () {
  mainState.saveSettings()
}
</script>

<template>
  <Popup
    class="globalline-settings-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template #header>
      <h2>
        <SVGIcon name="setting" />
        <span>{{ $t("settings") }} - {{ $t("globalline") }}</span>
      </h2>
    </template>
    <template #body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>
