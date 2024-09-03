<script lang="ts" setup>
import { inject } from "vue"
import EasyForm from "@/components/forms/EasyForm.vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import UI_LANGUAGES from "@/consts/ui-languages.json"

const emit = defineEmits<{(event: string): void}>()

const mainState = inject("state") as MainState

const easyFormProps: TTEasyForm = {
  hasSubmitButton: false,
  data: [
    {
      state: mainState.currentSetting,
      model: "uiLanguage",
      type: "radio",
      options: UI_LANGUAGES,
      onUpdate () {
        emit("changeSetting")
      },
    },
  ],
}
</script>

<template>
  <Popup
    class="settings-popup"
    :hasCloseButton="true"
    @close="$emit('close')"
  >
    <template #header>
      <h2>
        <SVGIcon name="translate" />
        <span>{{ $t("uiLanguage") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="settings-popup__form-page">
        <div class="settings-popup__form">
          <div class="settings-popup__form__body">
            <EasyForm v-bind="easyFormProps" />
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
