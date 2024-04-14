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
        <span>{{ $t("psySafetySettings") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="settings-popup__form-page">
        <!-- 通知取得間隔 -->
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

        <!-- 通知バッジの非表示 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("hideNotificationBadge") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <Radios
              :state="mainState.currentSetting"
              model="hideNotificationBadge"
              :options="SETTINGS.HIDE_NOTIFICATION_BADGE"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />
          </div>
        </div>

        <!-- リアクション数の非表示 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("hideNumberOfReaction") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <Radios
              :state="mainState.currentSetting"
              model="hideNumberOfReaction"
              :options="SETTINGS.HIDE_NUMBER_OF_REACTION"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />
          </div>
        </div>

        <!-- ポストの匿名化 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("postAnonymization") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <Radios
              :state="mainState.currentSetting"
              model="postAnonymization"
              :options="SETTINGS.POST_ANONYMIZATION"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
