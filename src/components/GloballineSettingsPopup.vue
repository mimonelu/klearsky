<script lang="ts" setup>
import { inject } from "vue"
import EasyForm from "@/components/EasyForm.vue"
import Popup from "@/components/Popup.vue"
import SVGIcon from "@/components/SVGIcon.vue"
import languages from "@/consts/languages.json"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  submitButtonLabel: $t("apply"),
  submitCallback: close,
  data: [
    {
      state: mainState,
      model: "globallineLayout",
      label: $t("layout"),
      type: "radio",
      required: true,
      options: [
        { label: "Post", value: "post" },
        { label: "Slim", value: "slim" },
      ],
    },
    {
      state: mainState,
      model: "globallineLanguage",
      label: $t("language"),
      type: "select",
      required: true,
      options: languages,
    },
  ],
}

function close () {
  emit("close")
}
</script>

<template>
  <Popup
    class="globalline-settings-popup"
    :hasCloseButton="true"
    @close="close"
  >
    <template v-slot:header>
      <h2>
        <SVGIcon name="setting" />
        <span>{{ $t("settings") }} - {{ $t("globalline") }}</span>
      </h2>
    </template>
    <template v-slot:body>
      <EasyForm v-bind="easyFormProps" />
    </template>
  </Popup>
</template>
