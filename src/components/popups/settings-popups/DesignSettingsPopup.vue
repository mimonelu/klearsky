<script lang="ts" setup>
import { inject } from "vue"
import ColorThemeList from "@/components/list/ColorThemeList.vue"
import Popup from "@/components/popups/Popup.vue"
import Radios from "@/components/form-parts/Radios.vue"
import SVGIcon from "@/components/common/SVGIcon.vue"
import SETTINGS from "@/consts/settings.json"

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
        <SVGIcon name="setting" />
        <span>{{ $t("settings") }} - {{ $t("design") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="settings-popup__form-page">
        <!-- カラーテーマ -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("colorTheme") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <ColorThemeList />
          </div>
        </div>

        <!-- フォントサイズ -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("fontSize") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <Radios
              :state="mainState.currentSetting"
              model="fontSize"
              :options="SETTINGS.FONT_SIZES"
              layout="horizontal"
              @update="$emit('changeSetting')"
            />
          </div>
        </div>

        <!-- レイアウト -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("layout") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <label class="selectbox">
              <select
                v-model="mainState.currentSetting.layout"
                name="layout"
                @change="$emit('changeSetting')"
              >
                <option
                  v-for="layout, layoutIndex in SETTINGS.LAYOUTS"
                  :key="layoutIndex"
                  :value="layout.value"
                  :selected="layout.value === mainState.currentSetting.layout"
                >{{ $t(layout.label) }}</option>
              </select>
            </label>
          </div>
        </div>

        <!-- メインエリアの不透明度 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("mainAreaOpacity") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <label class="selectbox">
              <select
                v-model="mainState.currentSetting.mainAreaOpacity"
                name="mainAreaOpacity"
                @change="$emit('changeSetting')"
              >
                <option
                  v-for="mainAreaOpacity, mainAreaOpacityIndex in SETTINGS.MAIN_AREA_OPACITIES"
                  :key="mainAreaOpacityIndex"
                  :value="mainAreaOpacity.value"
                  :selected="mainAreaOpacity.value === mainState.currentSetting.mainAreaOpacity"
                >{{ $t(mainAreaOpacity.label) }}</option>
              </select>
            </label>
          </div>
        </div>

        <!-- 背景画像 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("background") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <!-- 背景画像 - URL -->
            <div class="settings-popup__form__header">
              <span>{{ $t("backgroundImage") }}</span>
            </div>
            <input
              class="textbox"
              v-model="mainState.currentSetting.backgroundImage"
              type="url"
              name="backgroundImage"
              @change="$emit('changeSetting')"
            >

            <!-- 背景画像 - 不透明度 -->
            <div class="settings-popup__form__header">
              <span>{{ $t("backgroundOpacity") }}</span>
            </div>
            <label class="selectbox">
              <select
                v-model="mainState.currentSetting.backgroundOpacity"
                name="backgroundOpacity"
                @change="$emit('changeSetting')"
              >
                <option
                  v-for="backgroundOpacity, backgroundOpacityIndex in SETTINGS.BACKGROUND_OPACITIES"
                  :key="backgroundOpacityIndex"
                  :value="backgroundOpacity.value"
                  :selected="backgroundOpacity.value === mainState.currentSetting.backgroundOpacity"
                >{{ $t(backgroundOpacity.label) }}</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
