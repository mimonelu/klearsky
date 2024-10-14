<script lang="ts" setup>
import { inject } from "vue"
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
        <SVGIcon name="clock" />
        <span>{{ $t("timeSettings") }}</span>
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

        <!-- 新着フォロー中フィード取得間隔 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("timelineFetchInterval") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <label class="selectbox">
              <select
                v-model="mainState.currentSetting.timelineFetchInterval"
                name="timelineFetchInterval"
                @change="$emit('changeSetting')"
              >
                <option
                  v-for="interval, intervalIndex in SETTINGS.TIMELINE_FETCH_INTERVAL"
                  :key="intervalIndex"
                  :value="interval.value"
                  :selected="interval.value === mainState.currentSetting.timelineFetchInterval"
                >{{ $t(interval.label) }}</option>
              </select>
            </label>
          </div>
        </div>

        <!-- 新着通知取得間隔 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("notificationFetchInterval") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <label class="selectbox">
              <select
                v-model="mainState.currentSetting.notificationFetchInterval"
                name="notificationFetchInterval"
                @change="$emit('changeSetting')"
              >
                <option
                  v-for="interval, intervalIndex in SETTINGS.NOTIFICATION_FETCH_INTERVAL"
                  :key="intervalIndex"
                  :value="interval.value"
                  :selected="interval.value === mainState.currentSetting.notificationFetchInterval"
                >{{ $t(interval.label) }}</option>
              </select>
            </label>
          </div>
        </div>

        <!-- 新着チャット取得間隔 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("chatFetchInterval") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <label class="selectbox">
              <select
                v-model="mainState.currentSetting.chatFetchInterval"
                name="chatFetchInterval"
                @change="$emit('changeSetting')"
              >
                <option
                  v-for="interval, intervalIndex in SETTINGS.CHAT_FETCH_INTERVAL"
                  :key="intervalIndex"
                  :value="interval.value"
                  :selected="interval.value === mainState.currentSetting.chatFetchInterval"
                >{{ $t(interval.label) }}</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
