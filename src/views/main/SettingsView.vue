<script lang="ts" setup>
import { inject } from "vue"
import languages from "@/consts/languages.json"
import settings from "@/consts/settings.json"
import ColorTheme from "@/components/ColorTheme.vue"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState

function changeSetting () {
  mainState.saveSettings()
  mainState.updateSettings()
}
</script>

<template>
  <div class="settings-view">
    <PageHeader :title="`${$t('settings')} - ${mainState.atp.session?.handle ?? ''}`" />
    <div class="section-container">
      <!-- 言語 -->
      <div class="section">
        <div class="section__header">{{ $t("language") }}</div>
        <div class="section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.language"
              @change="changeSetting"
            >
              <option
                v-for="language, languageIndex in languages"
                :key="languageIndex"
                :value="language.value"
                :selected="language.value === mainState.currentSetting.language"
              >{{ $t(language.label) }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- フォントサイズ -->
      <div class="section">
        <div class="section__header">{{ $t("fontSize") }}</div>
        <div class="section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.fontSize"
              @change="changeSetting"
            >
              <option
                v-for="fontSize, fontSizeIndex in settings.fontSizes"
                :key="fontSizeIndex"
                :value="fontSize.value"
                :selected="fontSize.value === mainState.currentSetting.fontSize"
              >{{ $t(fontSize.label) }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- カラーテーマ -->
      <div class="section">
        <div class="section__header">{{ $t("colorTheme") }}</div>
        <div class="section__body">
          <ColorTheme />
        </div>
      </div>

      <!-- 背景画像 URL -->
      <div class="section">
        <div class="section__header">{{ $t("backgroundImage") }}</div>
        <div class="section__body">
          <input
            v-model="mainState.currentSetting.backgroundImage"
            class="textbox"
            type="url"
            @change="changeSetting"
          >
        </div>
      </div>

      <!-- 背景画像 不透明度 -->
      <div class="section">
        <div class="section__header">{{ $t("backgroundOpacity") }}</div>
        <div class="section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.backgroundOpacity"
              @change="changeSetting"
            >
              <option
                v-for="backgroundOpacity, backgroundOpacityIndex in settings.backgroundOpacities"
                :key="backgroundOpacityIndex"
                :value="backgroundOpacity.value"
                :selected="backgroundOpacity.value === mainState.currentSetting.backgroundOpacity"
              >{{ $t(backgroundOpacity.label) }}</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.section-container {
  display: flex;
  flex-direction: column;
  grid-gap: 2rem;
  padding: 2rem;
}

.section {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
}

.section__header {
  font-size: 1.25rem;
}

.section__body {
  input {
    width: 100%;
  }
}
</style>
