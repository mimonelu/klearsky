<script lang="ts" setup>
import { inject } from "vue"
import ColorThemeList from "@/components/lists/ColorThemeList.vue"
import Popup from "@/components/popups/Popup.vue"
import Radios from "@/components/forms/Radios.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
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
        <SVGIcon name="palette" />
        <span>{{ $t("designSettings") }}</span>
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

        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("font") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <!-- フォントサイズ -->
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

            <!-- フォントのカーニング -->
            <div class="settings-popup__form__header">
              <span>{{ $t("fontKerning") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="fontKerning"
                :options="SETTINGS.FONT_KERNINGS"
                layout="horizontal"
                @update="$emit('changeSetting')"
              />
            </div>

            <!-- フォントのアンチエイリアス -->
            <div class="settings-popup__form__header">
              <span>{{ $t("fontAntialiasing") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Radios
                :state="mainState.currentSetting"
                model="fontAntialiasing"
                :options="SETTINGS.FONT_ANTIALIASINGS"
                layout="horizontal"
                @update="$emit('changeSetting')"
              />
            </div>
          </div>
        </div>

        <!-- 壁紙 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("background") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <!-- 壁紙 - URL -->
            <div class="settings-popup__form__header">
              <span>{{ $t("backgroundImage") }}</span>

              <!-- ヘルプボタン -->
              <button
                class="settings-popup__help-button"
                @click.prevent="$emit('showDescription', 'backgroundImage')"
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <input
              class="textbox"
              v-model="mainState.currentSetting.backgroundImage"
              type="url"
              name="backgroundImage"
              @change="$emit('changeSetting')"
            >

            <!-- 壁紙 - 不透明度 -->
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
      </div>
    </template>
  </Popup>
</template>
