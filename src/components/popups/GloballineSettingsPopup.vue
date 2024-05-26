<script lang="ts" setup>
import { inject } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  submitButtonLabel: $t("apply"),
  submitCallback: close,
  blurOnSubmit: true,
  data: [
    // ポスト言語を持たないポストのフィルタリング
    {
      state: mainState.currentSetting,
      model: "globallineSkipPostHasNoLanguage",
      label: $t("globallineSkipPostHasNoLanguage"),
      type: "radio",
      options: [
        { label: "yes", value: true },
        { label: "no", value: false },
      ],
      layout: "horizontal",
      onUpdate: saveSetting,
    },

    // ポストの種別フィルタリング
    {
      state: mainState.currentSetting,
      model: "globallinePostTypes",
      label: $t("globallinePostTypes"),
      type: "checkbox",
      options: [
        { label: "post", value: "post" },
        { label: "reply", value: "reply" },
        { label: "quoteRepost", value: "quoteRepost" },
      ],
      layout: "vertical",
      onUpdate: saveSetting,
    },

    // フォロワー数によるフィルタリング
    {
      state: mainState.currentSetting,
      model: "globallineFollowersCountThreshold",
      label: $t("globallineFollowersCountThreshold"),
      placeholder: $t("globallineFollowersCountThresholdPlaceholder"),
      type: "text",
      autocomplete: "off",
      inputmode: "numeric",
      pattern: "^[\\-0-9]+$",
      onInput: saveSetting,
    },

    // ポストのレイアウト
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
      <EasyForm v-bind="easyFormProps">
        <template #free-3>
          <p>{{ $t("globallineFollowersCountThresholdDescription") }}</p>
        </template>
      </EasyForm>
    </template>
  </Popup>
</template>
