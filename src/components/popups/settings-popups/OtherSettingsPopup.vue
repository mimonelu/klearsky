<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import Radios from "@/components/forms/Radios.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import CONSTS from "@/consts/consts.json"
import SETTINGS from "@/consts/settings.json"

const $t = inject("$t") as Function

const mainState = inject("state") as MainState

const emit = defineEmits<{(event: string): void}>()

function setOfficialValueToAtprotoProxyAppBsky () {
  mainState.currentSetting.atprotoProxyAppBsky = CONSTS.OFFICIAL_ATPROTO_PROXY_APP_BSKY
  emit("changeSetting")
}

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
              type="button"
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

        <!-- Danger zone -->
        <div class="settings-popup__form danger-zone">
          <div class="settings-popup__form__header">
            <span>{{ $t("dangerZone") }}</span>
          </div>
          <div class="settings-popup__form__body">

            <!-- atproto-proxy -->
            <div class="settings-popup__form__header">
              <span>{{ $t("atprotoProxyAppBskySetting") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <input
                class="textbox"
                v-model="mainState.currentSetting.atprotoProxyAppBsky"
                type="string"
                name="atprotoProxyAppBsky"
                @blur="$emit('changeSetting')"
              >
              <div class="settings-popup__form__button-container">
                <button
                  type="button"
                  class="button button--small"
                  @click.prevent="setOfficialValueToAtprotoProxyAppBsky"
                >
                  <span>{{ $t("setOfficialValue") }}</span>
                </button>
              </div>
            </div>

            <!-- 設定リセット -->
            <div class="settings-popup__form__header">
              <span>{{ $t("resetSettings") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <button
                type="button"
                class="button--important"
                @click.prevent="resetSettings"
              >
                <span>{{ $t("reset") }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
// 以下すべて .danger-zone 用

.settings-popup {
  &:deep(.popup-body) {
    padding: unset;
  }
}

.settings-popup__form {
  padding: 0 1rem;
  &:first-child {
    padding-top: 1rem;
  }
  &:last-child {
    border-top: 1px solid rgb(var(--fg-color), 0.25);
    padding: 1rem;
  }
}

.danger-zone {
  background-color: rgb(var(--notice-color), 0.125);
}
</style>
