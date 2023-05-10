<script lang="ts" setup>
import { inject } from "vue"
import Checkboxes from "@/components/Checkboxes.vue"
import ColorTheme from "@/components/ColorTheme.vue"
import Radios from "@/components/Radios.vue"
import languages from "@/consts/languages.json"
import settings from "@/consts/settings.json"

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

      <!-- 自動翻訳 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("autoTranslation") }}</div>
        <div class="settings-section__body">
          <label class="selectbox">
            <select
              v-model="mainState.currentSetting.autoTranslation"
              @change="changeSetting"
            >
              <option
                :value="false"
                :selected="!mainState.currentSetting.autoTranslation"
              >{{ $t("disabled") }}</option>
              <option
                :value="true"
                :selected="mainState.currentSetting.autoTranslation"
              >{{ $t("enabled") }}</option>
            </select>
          </label>
          <ul class="notification-list">
            <li>{{ $t("autoTranslationRemarks1") }}</li>
            <li>{{ $t("autoTranslationRemarks2") }}</li>
            <li>{{ $t("autoTranslationRemarks3") }}</li>
            <li><a class="textlink" href="https://mymemory.translated.net/" rel="noreferrer" target="_blank">{{ $t("autoTranslationRemarks4") }}</a></li>
          </ul>

          <!-- 自動翻訳 - 除外する言語 -->
          <div class="settings-section__sub-header">{{ $t("autoTranslationIgnoreLanguage") }}</div>
          <input
            v-model="mainState.currentSetting.autoTranslationIgnoreLanguage"
            class="textbox"
            type="text"
            placeholder="en, zh, es, ..."
            @change="changeSetting"
          >
          <ul class="notification-list">
            <li><a class="textlink" href="https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" rel="noreferrer" target="_blank">List of ISO 639-1 codes</a></li>
          </ul>
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
          <Checkboxes
            :state="mainState.currentSetting"
            model="replyControl"
            :options="settings.replyControls"
            @update="saveSetting"
          />

          <!-- タイムラインの制御 - リポスト -->
          <div class="settings-section__sub-header">{{ $t("repostControl") }}</div>
          <Checkboxes
            :state="mainState.currentSetting"
            model="repostControl"
            :options="settings.repostControls"
            @update="saveSetting"
          />
        </div>
      </div>

      <!-- 画像の制御 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("imageControl") }}</div>
        <div class="settings-section__body">
          <Radios
            :state="mainState.currentSetting"
            model="imageControl"
            :options="settings.imageControls"
            @update="saveSetting"
          />
        </div>
      </div>

      <!-- 画像サイズの比率 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("imageAspectRatio") }}</div>
        <div class="settings-section__body">
          <Radios
            :state="mainState.currentSetting"
            model="imageAspectRatio"
            :options="settings.imageAspectRatio"
            @update="saveSetting"
          />
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

      <!-- 背景画像 -->
      <div class="settings-section">
        <div class="settings-section__header">{{ $t("background") }}</div>
        <div class="settings-section__body">
          <!-- 背景画像 - URL -->
          <div class="settings-section__sub-header">{{ $t("backgroundImage") }}</div>
          <input
            v-model="mainState.currentSetting.backgroundImage"
            class="textbox"
            type="url"
            @change="changeSetting"
          >

          <!-- 背景画像 - 不透明度 -->
          <div class="settings-section__sub-header">{{ $t("backgroundOpacity") }}</div>
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

      <!-- 心理的安全性 -->
      <div class="settings-section">
        <div class="settings-section__header">💚 {{ $t("psySafety") }}</div>
        <div class="settings-section__body">
          <!-- 心理的安全性 - リアクション数の非表示 -->
          <div class="settings-section__sub-header">{{ $t("hideNumberOfReaction") }}</div>
          <Radios
            :state="mainState.currentSetting"
            model="hideNumberOfReaction"
            :options="settings.hideNumberOfReaction"
            @update="saveSetting"
          />

          <!-- 心理的安全性 - ポストの匿名化 -->
          <div class="settings-section__sub-header">{{ $t("postAnonymization") }}</div>
          <Radios
            :state="mainState.currentSetting"
            model="postAnonymization"
            :options="settings.postAnonymization"
            @update="saveSetting"
          />
        </div>
      </div>

      <!-- Lightning -->
      <div class="settings-section">
        <div class="settings-section__header">⚡ {{ $t("lightning") }}</div>
        <div class="settings-section__body">
          <input
            v-model="mainState.currentSetting.lightning"
            class="textbox"
            type="url"
            placeholder="sample@wallet.com, lnurlxxx, lnbcxxx, ..."
            @change="changeSetting"
          >
          <ul class="notification-list">
            <li>{{ $t("lightningDescription") }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.notification-list {
  font-size: 0.875rem;

  & > li {
    line-height: 1.5;
    margin-left: 1.5rem;
    text-indent: -0.75rem;

    &::before {
      content: "⭐";
      display: inline-block;
      margin-right: 0.5rem;
    }
  }
}
</style>
