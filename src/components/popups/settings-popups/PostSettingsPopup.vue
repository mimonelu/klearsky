<script lang="ts" setup>
import { inject } from "vue"
import Checkboxes from "@/components/forms/Checkboxes.vue"
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
        <SVGIcon name="post" />
        <span>{{ $t("postSettings") }}</span>
      </h2>
    </template>
    <template #body>
      <div class="settings-popup__form-page">
        <!-- 自動翻訳 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("autoTranslation") }}</span>

            <!-- ヘルプボタン -->
            <button
              class="settings-popup__help-button"
              @click.prevent="$emit('showDescription', 'autoTranslation')"
            >
              <SVGIcon name="help" />
            </button>
          </div>
          <div class="settings-popup__form__body">
            <Radios
              :state="mainState.currentSetting"
              model="autoTranslation"
              :options="SETTINGS.AUTO_TRANSLATIONS"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />

            <!-- 自動翻訳 - 除外する言語 -->
            <div class="settings-popup__form__header">
              <span>{{ $t("autoTranslationIgnoreLanguage") }}</span>

              <!-- ヘルプボタン -->
              <button
                class="settings-popup__help-button"
                @click.prevent="$emit('showDescription', 'autoTranslationIgnoreLanguage')"
              >
                <SVGIcon name="help" />
              </button>
            </div>
            <input
              class="textbox"
              v-model="mainState.currentSetting.autoTranslationIgnoreLanguage"
              type="text"
              name="autoTranslationIgnoreLanguage"
              placeholder="en, zh, es, ..."
              @change="$emit('changeSetting')"
            >
          </div>
        </div>

        <!-- フィードの制御 -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("feedControl") }}</span>

            <!-- ヘルプボタン -->
            <button
              class="settings-popup__help-button"
              @click.prevent="$emit('showDescription', 'feedControl')"
            >
              <SVGIcon name="help" />
            </button>
          </div>
          <div class="settings-popup__form__body">
            <!-- フィードの制御 - リプライ -->
            <div class="settings-popup__form__header">
              <span>{{ $t("replyFolding") }}</span>
            </div>
            <Checkboxes
              :state="mainState.currentSetting"
              model="replyFolding"
              :options="SETTINGS.REPLY_FOLDINGS"
              @update="$emit('saveSetting')"
            />

            <!-- フィードの制御 - リポスト -->
            <div class="settings-popup__form__header">
              <span>{{ $t("repostFolding") }}</span>
            </div>
            <Checkboxes
              :state="mainState.currentSetting"
              model="repostFolding"
              :options="SETTINGS.REPOST_FOLDINGS"
              @update="$emit('saveSetting')"
            />
          </div>
        </div>

        <!-- メディア -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("image") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <!-- メディア - メディアの制御 -->
            <div class="settings-popup__form__header">
              <span>{{ $t("imageFolding") }}</span>
            </div>
            <Radios
              :state="mainState.currentSetting"
              model="imageFolding"
              :options="SETTINGS.IMAGE_FOLDINGS"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />

            <!-- メディア - メディアの高さの最大値 -->
            <div class="settings-popup__form__header">
              <span>{{ $t("imageMaxHeightRatio") }}</span>
            </div>
            <Radios
              :state="mainState.currentSetting"
              model="imageMaxHeightRatio"
              :options="SETTINGS.IMAGE_MAX_HEIGHT_RATIO"
              layout="vertical"
              @update="$emit('saveSetting')"
            />

            <!-- メディア - アニメーション画像の自動再生 -->
            <div class="settings-popup__form__header">
              <span>{{ $t("imageAutoPlay") }}</span>
            </div>
            <Radios
              :state="mainState.currentSetting"
              model="imageAutoPlay"
              :options="SETTINGS.IMAGE_AUTO_PLAY"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />

            <!-- メディア - 動画の先読み -->
            <div class="settings-popup__form__header">
              <span>{{ $t("videoPreload") }}</span>
            </div>
            <Radios
              :state="mainState.currentSetting"
              model="videoPreload"
              :options="SETTINGS.VIDEO_PRELOAD"
              layout="horizontal"
              @update="$emit('saveSetting')"
            />
          </div>
        </div>

        <!-- リンクカード -->
        <div class="settings-popup__form">
          <div class="settings-popup__form__header">
            <span>{{ $t("linkCardControl") }}</span>
          </div>
          <div class="settings-popup__form__body">
            <!-- リンクカード - リンクカードのレイアウト -->
            <div class="settings-popup__form__header">
              <span>{{ $t("linkcardLayout") }}</span>
            </div>
            <Radios
              :state="mainState.currentSetting"
              model="linkcardLayout"
              :options="SETTINGS.LINKCARD_LAYOUT"
              layout="vertical"
              @update="$emit('saveSetting')"
            />

            <!-- リンクカード - リンクカードの埋込コンテンツ制御 -->
            <div class="settings-popup__form__header">
              <span>{{ $t("linkcardEmbeddedControl") }}</span>
            </div>
            <div class="settings-popup__form__body">
              <Checkboxes
                :state="mainState.currentSetting"
                model="linkcardEmbeddedControl"
                :options="SETTINGS.LINKCARD_EMBEDDED_CONTROL"
                layout="vertical"
                @update="$emit('saveSetting')"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </Popup>
</template>
