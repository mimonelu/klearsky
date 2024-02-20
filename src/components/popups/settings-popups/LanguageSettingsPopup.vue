<script lang="ts" setup>
import { computed, inject, reactive, type ComputedRef } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import LANGUAGES from "@/consts/languages"
import UI_LANGUAGES from "@/consts/ui-languages.json"

const mainState = inject("state") as MainState

const state = reactive<{
  contentLanguages: ComputedRef<string[]>
  postLanguages: ComputedRef<string[]>
}>({
  contentLanguages: computed((): string[] => {
    return mainState.currentSetting.contentLanguages?.map((contentLanguage: string) => {
      return LANGUAGES.find((language: TTOption) => {
        return contentLanguage === language.value
      })?.label ?? ""
    }) ?? []
  }),
  postLanguages: computed((): string[] => {
    return mainState.currentSetting.postLanguages?.map((postLanguage: string) => {
      return LANGUAGES.find((language: TTOption) => {
        return postLanguage === language.value
      })?.label ?? ""
    }) ?? []
  }),
})
</script>

<template>
  <Popup
    class="settings-popup"
    :hasCloseButton="true"
    @close="$emit('close')"
  >
    <template #header>
      <h2>
        <SVGIcon name="setting" />
        <span>{{ $t("settings") }} - {{ $t("language") }}</span>
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

        <!-- コンテンツ言語ポップアップトリガー -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("contentLanguages") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <button
              class="button--bordered settings-popup__button-has-multi-labels"
              @click="$emit('openContentLanguagesPopup')"
            >
              <span v-if="state.contentLanguages.length === 0">{{ $t("notSelected") }}</span>
              <span v-else>{{ state.contentLanguages.join(", ") }}</span>
            </button>
          </div>
        </div>

        <!-- ポスト言語ポップアップトリガー -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("postLanguages") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <button
              class="button--bordered settings-popup__button-has-multi-labels"
              @click="$emit('openPostLanguagesPopup')"
            >
              <span v-if="state.postLanguages.length === 0">{{ $t("notSelected") }}</span>
              <span v-else>{{ state.postLanguages.join(", ") }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
