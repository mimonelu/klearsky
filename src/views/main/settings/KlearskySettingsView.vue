<script lang="ts" setup>
import { inject } from "vue"
import languages from "@/consts/languages.json"
import settings from "@/consts/settings.json"
import ColorTheme from "@/components/ColorTheme.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState

function saveSetting () {
  mainState.saveSettings()
}

function changeSetting () {
  mainState.saveSettings()
  mainState.updateSettings()
}
</script>

<template>
  <div class="klearsky-settings-view">
    <div class="settings-section-container">
      <!-- 言語 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("language") }}</div>
        <div class="settings-section__body">
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
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("fontSize") }}</div>
        <div class="settings-section__body">
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

      <!-- タイムラインの制御 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("timelineControl") }}</div>
        <div class="settings-section__description">{{ $t("timelineControlDescription") }}</div>
        <div class="settings-section__body">
          <!-- タイムラインの制御 - リプライ -->
          <div class="settings-section__sub-header">{{ $t("replyControl") }}</div>
          <div class="checkbox-container">
            <label
              v-for="value of [1, 2, 3, 4, 5]"
              :key="value"
              class="checkbox"
              :data-checked="mainState.currentSetting.replyControl?.includes(value)"
            >
              <input
                v-model="mainState.currentSetting.replyControl"
                type="checkbox"
                :value="value"
                @change="saveSetting"
              >
              <SVGIcon name="check" />
              <span>{{ $t(`replyControl${value}`) }}</span>
            </label>
          </div>

          <!-- タイムラインの制御 - リポスト -->
          <div class="settings-section__sub-header">{{ $t("repostControl") }}</div>
          <div class="checkbox-container">
            <label
              v-for="value of [1, 2, 3, 4, 5]"
              :key="value"
              class="checkbox"
              :data-checked="mainState.currentSetting.repostControl?.includes(value)"
            >
              <input
                v-model="mainState.currentSetting.repostControl"
                type="checkbox"
                :value="value"
                @change="saveSetting"
              >
              <SVGIcon name="check" />
              <span>{{ $t(`repostControl${value}`) }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 画像の制御 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("imageControl") }}</div>
        <div class="settings-section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.imageControl"
              @change="changeSetting"
            >
              <option
                v-for="imageControl, imageControlIndex in settings.imageControls"
                :key="imageControlIndex"
                :value="imageControl.value"
                :selected="imageControl.value === mainState.currentSetting.imageControl"
              >{{ $t(imageControl.label) }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- レイアウト -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("layout") }}</div>
        <div class="settings-section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.layout"
              @change="changeSetting"
            >
              <option
                v-for="layout, layoutIndex in settings.layouts"
                :key="layoutIndex"
                :value="layout.value"
                :selected="layout.value === mainState.currentSetting.layout"
              >{{ $t(layout.label) }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- カラーテーマ -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("colorTheme") }}</div>
        <div class="settings-section__body">
          <ColorTheme />
        </div>
      </div>

      <!-- メインエリアの不透明度 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("mainAreaOpacity") }}</div>
        <div class="settings-section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.mainAreaOpacity"
              @change="changeSetting"
            >
              <option
                v-for="mainAreaOpacity, mainAreaOpacityIndex in settings.mainAreaOpacities"
                :key="mainAreaOpacityIndex"
                :value="mainAreaOpacity.value"
                :selected="mainAreaOpacity.value === mainState.currentSetting.mainAreaOpacity"
              >{{ $t(mainAreaOpacity.label) }}</option>
            </select>
          </label>
        </div>
      </div>

      <!-- 背景画像 URL -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("backgroundImage") }}</div>
        <div class="settings-section__body">
          <input
            v-model="mainState.currentSetting.backgroundImage"
            class="textbox"
            type="url"
            @change="changeSetting"
          >
        </div>
      </div>

      <!-- 背景画像 不透明度 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("backgroundOpacity") }}</div>
        <div class="settings-section__body">
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
.checkbox-container {
  display: flex;
  flex-direction: column;
  grid-gap: 0.5rem;
}

.checkbox-container:not(:last-child) {
  margin-bottom: 1rem;
}

.checkbox {
  cursor: pointer;
  display: flex;
  align-items: center;

  & > .svg-icon {
    fill: rgba(var(--accent-color), 0.25);
    margin-right: 0.5rem;
  }
  &[data-checked="true"] > .svg-icon {
    fill: rgb(var(--accent-color));
  }

  & > span {
    color: rgba(var(--fg-color), 0.875);
    line-height: 1.375;
  }
  &:focus > span,
  &:hover > span {
    color: rgb(var(--fg-color));
  }
  &[data-checked="true"] > span {
    color: rgba(var(--accent-color), 0.875);
  }
  &[data-checked="true"]:focus > span,
  &[data-checked="true"]:hover > span {
    color: rgb(var(--accent-color));
  }
}
</style>
