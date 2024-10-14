<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import Radios from "@/components/forms/Radios.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import SETTINGS from "@/consts/settings.json"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

async function resetSettings () {
  Util.blurElement()
  const result = await mainState.openConfirmationPopup({
    title: $t("resetSettings"),
    text: $t("resetSettingsDetail"),
  })
  if (!result) return
  mainState.resetSettings()
  location.reload()
}
</script>

<template>
  <Popup
    class="settings-popup"
    :hasCloseButton="true"
    @close="$emit('close')"
  >
    <template #header>
      <h2>
        <SVGIcon name="shimmer" />
        <span>{{ $t("etcSettings") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="settings-popup__form-page">
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

        <!-- 心理的安全性 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("psySafetySettings") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <!-- 新着バッジの非表示 -->
            <div class="settings-popup__form__header">
              <span>{{ $t("hideNotificationBadge") }}</span>
            </div>
            <Radios
              :state="mainState.currentSetting"
              model="hideNotificationBadge"
              :options="SETTINGS.HIDE_NOTIFICATION_BADGE"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />

            <!-- リアクション数の非表示 -->
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

            <!-- ポストの匿名化 -->
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

        <!-- 設定のリセット -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("development") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <button
              class="button--important"
              @click.prevent="resetSettings"
            >
              <span>{{ $t("resetSettings") }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
