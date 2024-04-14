<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import UI_LANGUAGES from "@/consts/ui-languages.json"

const mainState = inject("state") as MainState
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
        <!-- UI言語 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("uiLanguage") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <label class="selectbox">
              <select
                v-model="mainState.currentSetting.uiLanguage"
                name="uiLanguage"
                @change="$emit('changeSetting')"
              >
                <option
                  v-for="language, languageIndex in UI_LANGUAGES"
                  :key="languageIndex"
                  :value="language.value"
                  :selected="language.value === mainState.currentSetting.uiLanguage"
                >{{ $t(language.label) }}</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
