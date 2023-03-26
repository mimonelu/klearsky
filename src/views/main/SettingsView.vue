<script lang="ts" setup>
import { inject } from "vue"
import colorThemes from "@/consts/color-themes.json"
import languages from "@/consts/languages.json"
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
                v-for="language in languages"
                :value="language.value"
                :selected="language.value === mainState.currentSetting.language"
              >{{ $t(language.label) }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- カラーテーマ -->
      <div class="section">
        <div class="section__header">{{ $t("colorTheme") }}</div>
        <div class="section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.colorTheme"
              @change="changeSetting"
            >
              <option
                v-for="colorTheme in colorThemes"
                :value="colorTheme.value"
                :selected="colorTheme.value === mainState.currentSetting.colorTheme"
              >{{ $t(colorTheme.label) }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- 背景画像 -->
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
