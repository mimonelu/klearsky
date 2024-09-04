<script lang="ts" setup>
import { inject } from "vue"
import Popup from "@/components/popups/Popup.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

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
        <SVGIcon name="setting" />
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
