<script lang="ts" setup>
import { inject } from "vue"
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
        <span>{{ $t("settings") }} - {{ $t("etc") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="settings-popup__form-page">
        <!-- 時間表記 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("timeControl") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <Radios
              :state="mainState.currentSetting"
              model="timeControl"
              :options="SETTINGS.TIME_CONTROLS"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />
          </div>
        </div>

        <!-- Lightning -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("lightning") }}</span>

            <!-- ヘルプボタン -->
            <button
              class="settings-popup__help-button"
              @click.prevent="$emit('showDescription', 'lightning')"
            >
              <SVGIcon name="help" />
            </button>
          </div>
          <div class="settings-popup__form__body">
            <input
              class="textbox"
              v-model="mainState.currentSetting.lightning"
              type="url"
              name="lightning"
              placeholder="sample@wallet.com, lnurlxxx, lnbcxxx, ..."
              @change="$emit('changeSetting')"
            >
          </div>
        </div>

        <!-- 設定のリセット -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("development") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <button
              class="button--important"
              @click.prevent="$emit('resetSettings')"
            >
              <span>{{ $t("resetSettings") }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
